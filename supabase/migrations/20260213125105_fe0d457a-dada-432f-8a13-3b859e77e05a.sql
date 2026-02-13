
-- =============================================================
-- Phase 0: Drop old WhatsApp tables (order matters for FKs)
-- =============================================================
DROP TABLE IF EXISTS whatsapp_messages CASCADE;
DROP TABLE IF EXISTS whatsapp_conversations CASCADE;
DROP TABLE IF EXISTS whatsapp_automations CASCADE;
DROP TABLE IF EXISTS whatsapp_agent_configs CASCADE;
DROP TABLE IF EXISTS whatsapp_templates CASCADE;

-- =============================================================
-- Phase 1: Chat Agent Tables Migration
-- =============================================================

-- 1. Add type column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'voice'
  CHECK (type IN ('voice', 'chat'));
CREATE INDEX IF NOT EXISTS idx_agents_org_type ON agents(organization_id, type);
COMMENT ON COLUMN agents.type IS 'Agent type: voice (calls) or chat (WhatsApp/web widget)';

-- 2. Enums
DO $$ BEGIN
    CREATE TYPE chat_session_status AS ENUM ('active', 'closed', 'human_handover');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE chat_channel AS ENUM ('whatsapp', 'web');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE chat_sender_role AS ENUM ('user', 'ai', 'human_agent', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE chat_template_status AS ENUM ('pending', 'approved', 'rejected', 'paused', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. chat_agent_configs
CREATE TABLE IF NOT EXISTS chat_agent_configs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id              UUID NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
    organization_id       UUID NOT NULL REFERENCES organizations(id),
    system_prompt         TEXT,
    custom_system_prefix  TEXT,
    model                 TEXT DEFAULT 'gpt-4o-mini',
    temperature           FLOAT DEFAULT 0.7,
    max_tokens            INT DEFAULT 500,
    greeting_message      TEXT,
    fallback_message_web  TEXT DEFAULT 'I''m having trouble. Please try again shortly.',
    fallback_message_wa   TEXT DEFAULT 'We''ll get back to you soon ❤️',
    use_summary           BOOLEAN DEFAULT true,
    modules               JSONB DEFAULT '[]',
    business_rules        JSONB DEFAULT '{}',
    whatsapp_provider     TEXT CHECK (whatsapp_provider IN ('meta', '360dialog')),
    whatsapp_config       JSONB DEFAULT '{}',
    enabled_templates     BOOLEAN DEFAULT false,
    template_namespace    TEXT,
    handover_notification_url TEXT,
    handover_timeout_hours    INT DEFAULT 24,
    is_deleted BOOLEAN DEFAULT false,
    version    INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_config_org ON chat_agent_configs(organization_id);
COMMENT ON TABLE chat_agent_configs IS 'Chat-specific config linked 1:1 to agents of type=chat';

-- 4. chat_sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id      UUID NOT NULL REFERENCES organizations(id),
    agent_config_id      UUID REFERENCES chat_agent_configs(id) ON DELETE SET NULL,
    external_id          TEXT,
    channel              chat_channel NOT NULL,
    status               chat_session_status DEFAULT 'active',
    conversation_summary TEXT,
    message_count        INT DEFAULT 0,
    last_message_at      TIMESTAMPTZ DEFAULT now(),
    metadata             JSONB DEFAULT '{}',
    created_at           TIMESTAMPTZ DEFAULT now(),
    updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_sessions_active
    ON chat_sessions(organization_id, external_id, channel)
    WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_chat_sessions_org ON chat_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_external ON chat_sessions(external_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_msg ON chat_sessions(last_message_at DESC);

-- 5. chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id        UUID NOT NULL REFERENCES chat_sessions(id),
    sender            chat_sender_role NOT NULL,
    content           TEXT NOT NULL,
    message_type      TEXT DEFAULT 'text',
    prompt_tokens     INT,
    completion_tokens INT,
    total_tokens      INT,
    latency_ms        INT,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- 6. chat_message_dedup
CREATE TABLE IF NOT EXISTS chat_message_dedup (
    external_message_id TEXT PRIMARY KEY,
    processed_at        TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE chat_message_dedup IS 'Dedup for WhatsApp webhook. Cron: DELETE WHERE processed_at < now() - 30 days';

-- 7. chat_templates
CREATE TABLE IF NOT EXISTS chat_templates (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id      UUID NOT NULL REFERENCES organizations(id),
    agent_config_id      UUID REFERENCES chat_agent_configs(id),
    name                 TEXT NOT NULL,
    category             TEXT DEFAULT 'utility',
    language             TEXT DEFAULT 'en',
    body                 TEXT NOT NULL,
    variables            JSONB DEFAULT '[]',
    status               chat_template_status DEFAULT 'pending',
    last_status_check_at TIMESTAMPTZ,
    external_id          TEXT,
    created_at           TIMESTAMPTZ DEFAULT now()
);

-- 8. chat_dead_letters
CREATE TABLE IF NOT EXISTS chat_dead_letters (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload     JSONB NOT NULL,
    error       TEXT,
    retries     INT DEFAULT 0,
    resolved    BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now()
);
COMMENT ON TABLE chat_dead_letters IS 'Failed queue items for manual retry';

-- =============================================================
-- Phase 2: Enable RLS + Policies
-- =============================================================

-- chat_agent_configs
ALTER TABLE chat_agent_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org chat agent configs"
ON chat_agent_configs FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create org chat agent configs"
ON chat_agent_configs FOR INSERT TO authenticated
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org chat agent configs"
ON chat_agent_configs FOR UPDATE TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org chat sessions"
ON chat_sessions FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create org chat sessions"
ON chat_sessions FOR INSERT TO authenticated
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org chat sessions"
ON chat_sessions FOR UPDATE TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- chat_messages (org-scoped via session)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org chat messages"
ON chat_messages FOR SELECT TO authenticated
USING (session_id IN (
    SELECT id FROM chat_sessions
    WHERE organization_id = get_user_organization_id(auth.uid())
));

CREATE POLICY "Users can create org chat messages"
ON chat_messages FOR INSERT TO authenticated
WITH CHECK (session_id IN (
    SELECT id FROM chat_sessions
    WHERE organization_id = get_user_organization_id(auth.uid())
));

-- chat_templates
ALTER TABLE chat_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org chat templates"
ON chat_templates FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can create org chat templates"
ON chat_templates FOR INSERT TO authenticated
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org chat templates"
ON chat_templates FOR UPDATE TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete org chat templates"
ON chat_templates FOR DELETE TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));

-- chat_message_dedup (system table, no user access needed — service_role only)
ALTER TABLE chat_message_dedup ENABLE ROW LEVEL SECURITY;

-- chat_dead_letters (admin only)
ALTER TABLE chat_dead_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view dead letters"
ON chat_dead_letters FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update dead letters"
ON chat_dead_letters FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================================
-- Phase 3: Updated_at triggers
-- =============================================================
CREATE TRIGGER update_chat_agent_configs_updated_at
    BEFORE UPDATE ON chat_agent_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
