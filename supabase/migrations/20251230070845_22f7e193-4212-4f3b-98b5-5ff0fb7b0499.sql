-- Step 1: Migrate any remaining phone_number data to from_number/to_number if not already done
UPDATE public.calls 
SET 
  from_number = COALESCE(from_number, phone_number),
  to_number = COALESCE(to_number, phone_number)
WHERE from_number IS NULL OR to_number IS NULL;

-- Step 2: Make call_type NOT NULL with default 'outbound'
-- First ensure all existing rows have a call_type
UPDATE public.calls 
SET call_type = 'outbound'::call_type 
WHERE call_type IS NULL;

ALTER TABLE public.calls 
ALTER COLUMN call_type SET NOT NULL,
ALTER COLUMN call_type SET DEFAULT 'outbound'::call_type;

-- Step 3: Drop the direction column (redundant with call_type)
ALTER TABLE public.calls DROP COLUMN IF EXISTS direction;

-- Step 4: Drop the phone_number column (replaced by from_number/to_number)
ALTER TABLE public.calls DROP COLUMN IF EXISTS phone_number;

-- Step 5: Add indexes for number-based lookups
CREATE INDEX IF NOT EXISTS idx_calls_from_number ON public.calls(from_number);
CREATE INDEX IF NOT EXISTS idx_calls_to_number ON public.calls(to_number);
CREATE INDEX IF NOT EXISTS idx_calls_call_type ON public.calls(call_type);

-- Step 6: Update the contact stats trigger to ONLY fire when outcome changes from NULL to non-NULL
CREATE OR REPLACE FUNCTION public.update_contact_call_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process if:
  -- 1. This is an UPDATE (not INSERT)
  -- 2. Outcome was NULL before and is now non-NULL
  -- 3. Contact exists
  IF TG_OP = 'UPDATE' 
     AND OLD.outcome IS NULL 
     AND NEW.outcome IS NOT NULL 
     AND NEW.contact_id IS NOT NULL THEN
    
    INSERT INTO public.contact_call_stats (
      contact_id,
      total_calls,
      answered_calls,
      missed_calls,
      failed_calls,
      total_duration_seconds,
      last_call_at,
      last_outcome,
      updated_at
    )
    VALUES (
      NEW.contact_id,
      1,
      CASE WHEN NEW.outcome = 'answered' THEN 1 ELSE 0 END,
      CASE WHEN NEW.outcome IN ('no_answer', 'busy', 'voicemail') THEN 1 ELSE 0 END,
      CASE WHEN NEW.outcome = 'failed' THEN 1 ELSE 0 END,
      COALESCE(NEW.duration_seconds, 0),
      COALESCE(NEW.ended_at, now()),
      NEW.outcome,
      now()
    )
    ON CONFLICT (contact_id) DO UPDATE SET
      total_calls = contact_call_stats.total_calls + 1,
      answered_calls = contact_call_stats.answered_calls + CASE WHEN NEW.outcome = 'answered' THEN 1 ELSE 0 END,
      missed_calls = contact_call_stats.missed_calls + CASE WHEN NEW.outcome IN ('no_answer', 'busy', 'voicemail') THEN 1 ELSE 0 END,
      failed_calls = contact_call_stats.failed_calls + CASE WHEN NEW.outcome = 'failed' THEN 1 ELSE 0 END,
      total_duration_seconds = contact_call_stats.total_duration_seconds + COALESCE(NEW.duration_seconds, 0),
      avg_sentiment_score = CASE
        WHEN NEW.sentiment_score IS NOT NULL THEN
          (COALESCE(contact_call_stats.avg_sentiment_score, 0) * contact_call_stats.total_calls + NEW.sentiment_score) / (contact_call_stats.total_calls + 1)
        ELSE contact_call_stats.avg_sentiment_score
      END,
      last_call_at = COALESCE(NEW.ended_at, now()),
      last_outcome = NEW.outcome,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Step 7: Recreate trigger with correct timing (AFTER UPDATE only)
DROP TRIGGER IF EXISTS tr_calls_update_contact_stats ON public.calls;

CREATE TRIGGER tr_calls_update_contact_stats
AFTER UPDATE ON public.calls
FOR EACH ROW
EXECUTE FUNCTION public.update_contact_call_stats();