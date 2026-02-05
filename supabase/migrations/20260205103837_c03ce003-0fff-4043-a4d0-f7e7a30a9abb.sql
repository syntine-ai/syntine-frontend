-- 1) Fix soft-delete UPDATE failing due to SELECT policy filtering out deleted rows
--    (PostgREST uses RETURNING under the hood; if the updated row can't be selected,
--     the UPDATE can fail with an RLS violation.)
DROP POLICY IF EXISTS "Users can view org agents" ON public.agents;

CREATE POLICY "Users can view org agents"
ON public.agents
FOR SELECT
TO authenticated
USING (
  (organization_id = get_user_organization_id(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2) Security linter: set immutable search_path on functions flagged by the linter

CREATE OR REPLACE FUNCTION public.sync_transcript_to_call_transcripts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_call_id uuid;
  v_next_seq int;
BEGIN
  -- Get call_id from call_uuid (call_uuid is text, call_id is uuid)
  SELECT id INTO v_call_id 
  FROM public.calls 
  WHERE id::text = NEW.call_uuid;
  
  -- If call doesn't exist yet, skip sync
  IF v_call_id IS NULL THEN
    RAISE NOTICE 'Call not found for call_uuid: %', NEW.call_uuid;
    RETURN NEW;
  END IF;
  
  -- Get next sequence number for this call
  SELECT COALESCE(MAX(sequence), 0) + 1 INTO v_next_seq
  FROM public.call_transcripts
  WHERE call_id = v_call_id;
  
  -- Insert into call_transcripts
  BEGIN
    INSERT INTO public.call_transcripts (
      call_id,
      speaker,
      content,
      sequence,
      confidence,
      latency_ms,
      timestamp
    ) VALUES (
      v_call_id,
      NEW.speaker::public.transcript_speaker,
      NEW.text,
      v_next_seq,
      NULL,
      NULL,
      NEW.created_at
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Synced transcript for call % (sequence %)', v_call_id, v_next_seq;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to sync transcript: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_signup_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://kbkxttsrwivgbjvxqsfu.supabase.co/functions/v1/handle-signup',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
    body := json_build_object('type', 'INSERT', 'table', 'users', 'record', row_to_json(NEW))::jsonb
  );
  RETURN NEW;
END;
$$;