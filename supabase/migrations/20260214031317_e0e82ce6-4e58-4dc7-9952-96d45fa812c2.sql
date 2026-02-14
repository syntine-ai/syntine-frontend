
-- 1. Create the new voice config table
CREATE TABLE public.voice_agent_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
    voice_settings JSONB DEFAULT '{}'::jsonb,
    phone_number_id UUID REFERENCES public.phone_numbers(id) ON DELETE SET NULL,
    first_speaker TEXT DEFAULT 'agent',
    first_message TEXT DEFAULT 'Hello!',
    first_message_delay_ms INTEGER DEFAULT 2000,
    prompt_config JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_voice_agent_config UNIQUE (agent_id)
);

-- 2. Migrate existing voice data (only for voice agents)
INSERT INTO public.voice_agent_configs (
    agent_id, voice_settings, phone_number_id, first_speaker,
    first_message, first_message_delay_ms, prompt_config,
    created_at, updated_at
)
SELECT
    id, voice_settings, phone_number_id, first_speaker,
    first_message, first_message_delay_ms, prompt_config,
    created_at, updated_at
FROM public.agents
WHERE type = 'voice';

-- 3. Drop voice-specific columns from agents table
ALTER TABLE public.agents
    DROP COLUMN voice_settings,
    DROP COLUMN phone_number_id,
    DROP COLUMN first_speaker,
    DROP COLUMN first_message,
    DROP COLUMN first_message_delay_ms,
    DROP COLUMN prompt_config;

-- 4. Index for fast lookups
CREATE INDEX idx_voice_agent_configs_agent_id ON public.voice_agent_configs(agent_id);

-- 5. Enable RLS
ALTER TABLE public.voice_agent_configs ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies scoped via agent -> organization
CREATE POLICY "Users can view org voice configs"
ON public.voice_agent_configs FOR SELECT TO authenticated
USING (agent_id IN (
    SELECT id FROM public.agents
    WHERE organization_id = get_user_organization_id(auth.uid())
));

CREATE POLICY "Users can create org voice configs"
ON public.voice_agent_configs FOR INSERT TO authenticated
WITH CHECK (agent_id IN (
    SELECT id FROM public.agents
    WHERE organization_id = get_user_organization_id(auth.uid())
));

CREATE POLICY "Users can update org voice configs"
ON public.voice_agent_configs FOR UPDATE TO authenticated
USING (agent_id IN (
    SELECT id FROM public.agents
    WHERE organization_id = get_user_organization_id(auth.uid())
))
WITH CHECK (agent_id IN (
    SELECT id FROM public.agents
    WHERE organization_id = get_user_organization_id(auth.uid())
));

CREATE POLICY "Users can delete org voice configs"
ON public.voice_agent_configs FOR DELETE TO authenticated
USING (agent_id IN (
    SELECT id FROM public.agents
    WHERE organization_id = get_user_organization_id(auth.uid())
));

-- 7. Auto-update timestamp trigger
CREATE TRIGGER update_voice_agent_configs_updated_at
    BEFORE UPDATE ON public.voice_agent_configs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
