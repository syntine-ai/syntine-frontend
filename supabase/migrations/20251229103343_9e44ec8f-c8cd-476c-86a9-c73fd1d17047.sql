-- =============================================
-- PHASE 2: AGENTS TABLE
-- PHASE 3: CONTACTS, CONTACT LISTS, STATS
-- =============================================

-- =====================
-- ENUMS
-- =====================
create type public.agent_status as enum ('active', 'inactive', 'draft');
create type public.agent_tone as enum ('professional', 'friendly', 'casual', 'formal', 'empathetic');
create type public.contact_status as enum ('active', 'inactive');
create type public.list_type as enum ('static', 'dynamic');
create type public.call_outcome as enum ('answered', 'no_answer', 'busy', 'failed', 'voicemail');

-- =====================
-- AGENTS TABLE (with soft delete)
-- =====================
create table public.agents (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    system_prompt text,
    tone public.agent_tone default 'professional',
    language text default 'English',
    status public.agent_status default 'draft',
    sentiment_rules jsonb default '{
      "positive": "Maintain enthusiasm and reinforce positive sentiment",
      "negative": "Show empathy, acknowledge concerns, offer solutions",
      "neutral": "Stay professional and guide conversation forward"
    }',
    voice_settings jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone -- SOFT DELETE
);

-- Indexes for agents
create index idx_agents_organization on public.agents(organization_id);
create index idx_agents_org_active on public.agents(organization_id) where deleted_at is null;
create index idx_agents_status on public.agents(organization_id, status) where deleted_at is null;

-- =====================
-- CONTACTS TABLE (with soft delete + unique phone per org)
-- =====================
create table public.contacts (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    first_name text,
    last_name text,
    phone text not null,
    email text,
    do_not_call boolean default false,
    status public.contact_status default 'active',
    tags jsonb default '[]',
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone -- SOFT DELETE
);

-- Unique phone per organization (only for non-deleted contacts)
create unique index idx_contacts_org_phone_active 
on public.contacts(organization_id, phone) 
where deleted_at is null;

-- Other indexes
create index idx_contacts_organization on public.contacts(organization_id);
create index idx_contacts_email_lower on public.contacts(lower(email)) where email is not null;
create index idx_contacts_org_status on public.contacts(organization_id, status) where deleted_at is null;
create index idx_contacts_phone on public.contacts(phone);

-- =====================
-- CONTACT LISTS TABLE (with soft delete)
-- =====================
create table public.contact_lists (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    description text,
    list_type public.list_type default 'static',
    filter_criteria jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone -- SOFT DELETE
);

create index idx_contact_lists_organization on public.contact_lists(organization_id);
create index idx_contact_lists_org_active on public.contact_lists(organization_id) where deleted_at is null;

-- =====================
-- CONTACT LIST MEMBERS (junction table)
-- =====================
create table public.contact_list_members (
    id uuid primary key default gen_random_uuid(),
    contact_id uuid references public.contacts(id) on delete cascade not null,
    contact_list_id uuid references public.contact_lists(id) on delete cascade not null,
    added_at timestamp with time zone default now(),
    unique (contact_id, contact_list_id)
);

create index idx_contact_list_members_contact on public.contact_list_members(contact_id);
create index idx_contact_list_members_list on public.contact_list_members(contact_list_id);

-- =====================
-- CONTACT CALL STATS (denormalized for fast UI)
-- =====================
create table public.contact_call_stats (
    contact_id uuid primary key references public.contacts(id) on delete cascade,
    total_calls int default 0,
    answered_calls int default 0,
    missed_calls int default 0,
    failed_calls int default 0,
    total_duration_seconds int default 0,
    avg_sentiment_score numeric(5,2),
    last_call_at timestamp with time zone,
    last_outcome public.call_outcome,
    updated_at timestamp with time zone default now()
);

-- =====================
-- ENABLE RLS
-- =====================
alter table public.agents enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_lists enable row level security;
alter table public.contact_list_members enable row level security;
alter table public.contact_call_stats enable row level security;

-- =====================
-- RLS POLICIES: AGENTS
-- =====================

-- SELECT: View agents in own org (exclude soft-deleted)
create policy "Users can view org agents"
on public.agents for select
to authenticated
using (
  deleted_at is null
  and (
    organization_id = public.get_user_organization_id(auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
);

-- INSERT: Create agents in own org
create policy "Users can create org agents"
on public.agents for insert
to authenticated
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- UPDATE: Update agents in own org
create policy "Users can update org agents"
on public.agents for update
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
)
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- DELETE: Soft delete (actually UPDATE deleted_at, but allow hard delete for admins)
create policy "Admins can delete agents"
on public.agents for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- =====================
-- RLS POLICIES: CONTACTS
-- =====================

-- SELECT: View contacts in own org (exclude soft-deleted)
create policy "Users can view org contacts"
on public.contacts for select
to authenticated
using (
  deleted_at is null
  and (
    organization_id = public.get_user_organization_id(auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
);

-- INSERT: Create contacts in own org
create policy "Users can create org contacts"
on public.contacts for insert
to authenticated
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- UPDATE: Update contacts in own org
create policy "Users can update org contacts"
on public.contacts for update
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
)
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- DELETE: Only admins can hard delete
create policy "Admins can delete contacts"
on public.contacts for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- =====================
-- RLS POLICIES: CONTACT LISTS
-- =====================

-- SELECT
create policy "Users can view org contact lists"
on public.contact_lists for select
to authenticated
using (
  deleted_at is null
  and (
    organization_id = public.get_user_organization_id(auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
);

-- INSERT
create policy "Users can create org contact lists"
on public.contact_lists for insert
to authenticated
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- UPDATE
create policy "Users can update org contact lists"
on public.contact_lists for update
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
)
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- DELETE
create policy "Admins can delete contact lists"
on public.contact_lists for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- =====================
-- RLS POLICIES: CONTACT LIST MEMBERS
-- =====================

-- SELECT: View members of lists in own org
create policy "Users can view org contact list members"
on public.contact_list_members for select
to authenticated
using (
  contact_list_id in (
    select id from public.contact_lists
    where organization_id = public.get_user_organization_id(auth.uid())
    and deleted_at is null
  )
  or public.has_role(auth.uid(), 'admin')
);

-- INSERT: Add members to lists in own org
create policy "Users can add contact list members"
on public.contact_list_members for insert
to authenticated
with check (
  contact_list_id in (
    select id from public.contact_lists
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

-- DELETE: Remove members from lists in own org
create policy "Users can remove contact list members"
on public.contact_list_members for delete
to authenticated
using (
  contact_list_id in (
    select id from public.contact_lists
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

-- =====================
-- RLS POLICIES: CONTACT CALL STATS
-- =====================

-- SELECT: View stats for contacts in own org
create policy "Users can view org contact stats"
on public.contact_call_stats for select
to authenticated
using (
  contact_id in (
    select id from public.contacts
    where organization_id = public.get_user_organization_id(auth.uid())
  )
  or public.has_role(auth.uid(), 'admin')
);

-- INSERT/UPDATE: Only via triggers/edge functions (service role)
-- No direct user insert/update policies needed

-- =====================
-- TRIGGERS: Auto-update timestamps
-- =====================
create trigger tr_agents_updated
  before update on public.agents
  for each row execute function public.update_updated_at();

create trigger tr_contacts_updated
  before update on public.contacts
  for each row execute function public.update_updated_at();

create trigger tr_contact_lists_updated
  before update on public.contact_lists
  for each row execute function public.update_updated_at();