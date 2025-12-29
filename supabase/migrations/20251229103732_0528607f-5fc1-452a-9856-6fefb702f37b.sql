-- =============================================
-- PHASE 4: CAMPAIGNS
-- PHASE 5: CALLS, TRANSCRIPTS, RECORDINGS
-- =============================================

-- =====================
-- ENUMS
-- =====================
create type public.campaign_status as enum ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled');
create type public.call_status as enum ('queued', 'ringing', 'in_progress', 'ended');
create type public.call_direction as enum ('inbound', 'outbound');
create type public.call_sentiment as enum ('positive', 'neutral', 'negative');
create type public.transcript_speaker as enum ('agent', 'caller', 'system');

-- =====================
-- CAMPAIGNS TABLE (with soft delete)
-- =====================
create table public.campaigns (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    name text not null,
    description text,
    status public.campaign_status default 'draft',
    concurrency int default 1 check (concurrency >= 1 and concurrency <= 100),
    schedule jsonb default '{
      "timezone": "UTC",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "start_time": "09:00",
      "end_time": "17:00"
    }',
    settings jsonb default '{
      "max_attempts": 3,
      "retry_delay_minutes": 60,
      "voicemail_detection": true,
      "call_recording": true
    }',
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone -- SOFT DELETE
);

-- Indexes for campaigns
create index idx_campaigns_organization on public.campaigns(organization_id);
create index idx_campaigns_org_active on public.campaigns(organization_id) where deleted_at is null;
create index idx_campaigns_org_status on public.campaigns(organization_id, status) where deleted_at is null;

-- =====================
-- CAMPAIGN AGENTS (junction table)
-- =====================
create table public.campaign_agents (
    id uuid primary key default gen_random_uuid(),
    campaign_id uuid references public.campaigns(id) on delete cascade not null,
    agent_id uuid references public.agents(id) on delete cascade not null,
    is_primary boolean default false,
    created_at timestamp with time zone default now(),
    unique (campaign_id, agent_id)
);

create index idx_campaign_agents_campaign on public.campaign_agents(campaign_id);
create index idx_campaign_agents_agent on public.campaign_agents(agent_id);

-- =====================
-- CAMPAIGN CONTACT LISTS (junction table)
-- =====================
create table public.campaign_contact_lists (
    id uuid primary key default gen_random_uuid(),
    campaign_id uuid references public.campaigns(id) on delete cascade not null,
    contact_list_id uuid references public.contact_lists(id) on delete cascade not null,
    priority int default 0,
    created_at timestamp with time zone default now(),
    unique (campaign_id, contact_list_id)
);

create index idx_campaign_contact_lists_campaign on public.campaign_contact_lists(campaign_id);
create index idx_campaign_contact_lists_list on public.campaign_contact_lists(contact_list_id);

-- =====================
-- CALLS TABLE (with status/outcome separation + attempt tracking)
-- =====================
create table public.calls (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade not null,
    campaign_id uuid references public.campaigns(id) on delete set null,
    agent_id uuid references public.agents(id) on delete set null,
    contact_id uuid references public.contacts(id) on delete set null,
    external_call_id text,
    phone_number text not null,
    
    -- LIFECYCLE vs OUTCOME (separated)
    status public.call_status default 'queued',
    outcome public.call_outcome, -- NULL until call ends
    
    -- RETRY TRACKING
    attempt_number int default 1 check (attempt_number >= 1),
    
    direction public.call_direction default 'outbound',
    duration_seconds int,
    sentiment public.call_sentiment,
    sentiment_score int check (sentiment_score >= 0 and sentiment_score <= 100),
    summary text,
    tags jsonb default '[]',
    metadata jsonb default '{}',
    error_message text,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    created_at timestamp with time zone default now()
);

-- Indexes for calls
create index idx_calls_organization on public.calls(organization_id);
create index idx_calls_org_created on public.calls(organization_id, created_at desc);
create index idx_calls_campaign on public.calls(campaign_id);
create index idx_calls_contact on public.calls(contact_id);
create index idx_calls_contact_attempt on public.calls(contact_id, attempt_number);
create index idx_calls_campaign_outcome on public.calls(campaign_id, outcome);
create index idx_calls_status on public.calls(status) where status != 'ended';
create index idx_calls_external_id on public.calls(external_call_id) where external_call_id is not null;

-- =====================
-- CALL TRANSCRIPTS
-- =====================
create table public.call_transcripts (
    id uuid primary key default gen_random_uuid(),
    call_id uuid references public.calls(id) on delete cascade not null,
    speaker public.transcript_speaker not null,
    content text not null,
    sequence int not null,
    confidence numeric(4,3),
    latency_ms int,
    timestamp timestamp with time zone default now()
);

create index idx_transcripts_call on public.call_transcripts(call_id);
create index idx_transcripts_call_seq on public.call_transcripts(call_id, sequence);

-- =====================
-- CALL RECORDINGS (stores path to storage, not the file itself)
-- =====================
create table public.call_recordings (
    id uuid primary key default gen_random_uuid(),
    call_id uuid references public.calls(id) on delete cascade not null unique,
    storage_path text not null,
    duration_seconds int,
    file_size_bytes bigint,
    mime_type text default 'audio/wav',
    created_at timestamp with time zone default now()
);

create index idx_recordings_call on public.call_recordings(call_id);

-- =====================
-- STORAGE BUCKET FOR RECORDINGS
-- =====================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'call-recordings',
    'call-recordings',
    false,
    52428800, -- 50MB max
    array['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm']
);

-- =====================
-- ENABLE RLS
-- =====================
alter table public.campaigns enable row level security;
alter table public.campaign_agents enable row level security;
alter table public.campaign_contact_lists enable row level security;
alter table public.calls enable row level security;
alter table public.call_transcripts enable row level security;
alter table public.call_recordings enable row level security;

-- =====================
-- RLS POLICIES: CAMPAIGNS
-- =====================

create policy "Users can view org campaigns"
on public.campaigns for select
to authenticated
using (
  deleted_at is null
  and (
    organization_id = public.get_user_organization_id(auth.uid())
    or public.has_role(auth.uid(), 'admin')
  )
);

create policy "Users can create org campaigns"
on public.campaigns for insert
to authenticated
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

create policy "Users can update org campaigns"
on public.campaigns for update
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
)
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

create policy "Admins can delete campaigns"
on public.campaigns for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- =====================
-- RLS POLICIES: CAMPAIGN AGENTS
-- =====================

create policy "Users can view org campaign agents"
on public.campaign_agents for select
to authenticated
using (
  campaign_id in (
    select id from public.campaigns
    where organization_id = public.get_user_organization_id(auth.uid())
    and deleted_at is null
  )
  or public.has_role(auth.uid(), 'admin')
);

create policy "Users can add campaign agents"
on public.campaign_agents for insert
to authenticated
with check (
  campaign_id in (
    select id from public.campaigns
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

create policy "Users can update campaign agents"
on public.campaign_agents for update
to authenticated
using (
  campaign_id in (
    select id from public.campaigns
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

create policy "Users can remove campaign agents"
on public.campaign_agents for delete
to authenticated
using (
  campaign_id in (
    select id from public.campaigns
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

-- =====================
-- RLS POLICIES: CAMPAIGN CONTACT LISTS
-- =====================

create policy "Users can view org campaign contact lists"
on public.campaign_contact_lists for select
to authenticated
using (
  campaign_id in (
    select id from public.campaigns
    where organization_id = public.get_user_organization_id(auth.uid())
    and deleted_at is null
  )
  or public.has_role(auth.uid(), 'admin')
);

create policy "Users can add campaign contact lists"
on public.campaign_contact_lists for insert
to authenticated
with check (
  campaign_id in (
    select id from public.campaigns
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

create policy "Users can remove campaign contact lists"
on public.campaign_contact_lists for delete
to authenticated
using (
  campaign_id in (
    select id from public.campaigns
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

-- =====================
-- RLS POLICIES: CALLS
-- =====================

create policy "Users can view org calls"
on public.calls for select
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

create policy "Users can create org calls"
on public.calls for insert
to authenticated
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

create policy "Users can update org calls"
on public.calls for update
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
)
with check (
  organization_id = public.get_user_organization_id(auth.uid())
);

-- =====================
-- RLS POLICIES: CALL TRANSCRIPTS
-- =====================

create policy "Users can view org call transcripts"
on public.call_transcripts for select
to authenticated
using (
  call_id in (
    select id from public.calls
    where organization_id = public.get_user_organization_id(auth.uid())
  )
  or public.has_role(auth.uid(), 'admin')
);

create policy "Users can create call transcripts"
on public.call_transcripts for insert
to authenticated
with check (
  call_id in (
    select id from public.calls
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

-- =====================
-- RLS POLICIES: CALL RECORDINGS
-- =====================

create policy "Users can view org call recordings"
on public.call_recordings for select
to authenticated
using (
  call_id in (
    select id from public.calls
    where organization_id = public.get_user_organization_id(auth.uid())
  )
  or public.has_role(auth.uid(), 'admin')
);

create policy "Users can create call recordings"
on public.call_recordings for insert
to authenticated
with check (
  call_id in (
    select id from public.calls
    where organization_id = public.get_user_organization_id(auth.uid())
  )
);

-- =====================
-- STORAGE RLS POLICIES
-- =====================

create policy "Users can view org recordings"
on storage.objects for select
to authenticated
using (
  bucket_id = 'call-recordings'
  and (storage.foldername(name))[1] in (
    select id::text from public.organizations
    where id = public.get_user_organization_id(auth.uid())
  )
);

create policy "Users can upload org recordings"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'call-recordings'
  and (storage.foldername(name))[1] in (
    select id::text from public.organizations
    where id = public.get_user_organization_id(auth.uid())
  )
);

-- =====================
-- TRIGGERS
-- =====================

create trigger tr_campaigns_updated
  before update on public.campaigns
  for each row execute function public.update_updated_at();

-- =====================
-- TRIGGER: Update contact_call_stats when call ends
-- =====================
create or replace function public.update_contact_call_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only process if outcome was just set and contact exists
  if new.outcome is not null and old.outcome is null and new.contact_id is not null then
    insert into public.contact_call_stats (
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
    values (
      new.contact_id,
      1,
      case when new.outcome = 'answered' then 1 else 0 end,
      case when new.outcome in ('no_answer', 'busy', 'voicemail') then 1 else 0 end,
      case when new.outcome = 'failed' then 1 else 0 end,
      coalesce(new.duration_seconds, 0),
      coalesce(new.ended_at, now()),
      new.outcome,
      now()
    )
    on conflict (contact_id) do update set
      total_calls = contact_call_stats.total_calls + 1,
      answered_calls = contact_call_stats.answered_calls + case when new.outcome = 'answered' then 1 else 0 end,
      missed_calls = contact_call_stats.missed_calls + case when new.outcome in ('no_answer', 'busy', 'voicemail') then 1 else 0 end,
      failed_calls = contact_call_stats.failed_calls + case when new.outcome = 'failed' then 1 else 0 end,
      total_duration_seconds = contact_call_stats.total_duration_seconds + coalesce(new.duration_seconds, 0),
      avg_sentiment_score = case
        when new.sentiment_score is not null then
          (coalesce(contact_call_stats.avg_sentiment_score, 0) * contact_call_stats.total_calls + new.sentiment_score) / (contact_call_stats.total_calls + 1)
        else contact_call_stats.avg_sentiment_score
      end,
      last_call_at = coalesce(new.ended_at, now()),
      last_outcome = new.outcome,
      updated_at = now();
  end if;
  
  return new;
end;
$$;

create trigger tr_calls_update_contact_stats
  after update on public.calls
  for each row
  execute function public.update_contact_call_stats();