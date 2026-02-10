
-- ═══════════════════════════════════════════════════════════
-- WhatsApp Module: New Tables + Organization Updates
-- (FK fix for call_queue skipped due to orphaned data)
-- ═══════════════════════════════════════════════════════════

-- 1. Add enabled_channels and whatsapp_credits to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS enabled_channels TEXT[] DEFAULT '{"voice"}',
  ADD COLUMN IF NOT EXISTS whatsapp_credits INTEGER DEFAULT 0;

-- 2. whatsapp_agent_configs
CREATE TABLE public.whatsapp_agent_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  bot_name TEXT NOT NULL DEFAULT 'WhatsApp Bot',
  tone TEXT NOT NULL DEFAULT 'friendly',
  language TEXT NOT NULL DEFAULT 'English',
  system_prompt TEXT,
  custom_instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

ALTER TABLE public.whatsapp_agent_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org wa agent config"
  ON public.whatsapp_agent_configs FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create org wa agent config"
  ON public.whatsapp_agent_configs FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org wa agent config"
  ON public.whatsapp_agent_configs FOR UPDATE
  USING (organization_id = get_user_organization_id(auth.uid()))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- 3. whatsapp_automations
CREATE TABLE public.whatsapp_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  automation_type TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  delay_minutes INTEGER DEFAULT 30,
  min_order_value NUMERIC DEFAULT 0,
  max_followups INTEGER DEFAULT 3,
  discount_enabled BOOLEAN DEFAULT false,
  discount_percent NUMERIC DEFAULT 0,
  template_id UUID,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, automation_type)
);

ALTER TABLE public.whatsapp_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org wa automations"
  ON public.whatsapp_automations FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create org wa automations"
  ON public.whatsapp_automations FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org wa automations"
  ON public.whatsapp_automations FOR UPDATE
  USING (organization_id = get_user_organization_id(auth.uid()))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- 4. whatsapp_conversations
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  agent_config_id UUID REFERENCES public.whatsapp_agent_configs(id) ON DELETE SET NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  trigger_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  order_id UUID,
  cart_id UUID,
  last_message_at TIMESTAMPTZ,
  window_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org wa conversations"
  ON public.whatsapp_conversations FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create org wa conversations"
  ON public.whatsapp_conversations FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org wa conversations"
  ON public.whatsapp_conversations FOR UPDATE
  USING (organization_id = get_user_organization_id(auth.uid()))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- 5. whatsapp_messages
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'outbound',
  message_type TEXT NOT NULL DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'sent',
  external_message_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org wa messages"
  ON public.whatsapp_messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM public.whatsapp_conversations
    WHERE organization_id = get_user_organization_id(auth.uid())
  ));

CREATE POLICY "Users can create org wa messages"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.whatsapp_conversations
    WHERE organization_id = get_user_organization_id(auth.uid())
  ));

-- 6. whatsapp_templates
CREATE TABLE public.whatsapp_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'utility',
  language TEXT NOT NULL DEFAULT 'en',
  body TEXT NOT NULL,
  header TEXT,
  footer TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  external_template_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org wa templates"
  ON public.whatsapp_templates FOR SELECT
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create org wa templates"
  ON public.whatsapp_templates FOR INSERT
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org wa templates"
  ON public.whatsapp_templates FOR UPDATE
  USING (organization_id = get_user_organization_id(auth.uid()))
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete org wa templates"
  ON public.whatsapp_templates FOR DELETE
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Timestamp triggers
CREATE TRIGGER update_whatsapp_agent_configs_updated_at
  BEFORE UPDATE ON public.whatsapp_agent_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_whatsapp_automations_updated_at
  BEFORE UPDATE ON public.whatsapp_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_whatsapp_templates_updated_at
  BEFORE UPDATE ON public.whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
