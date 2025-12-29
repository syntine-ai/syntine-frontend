-- =============================================
-- PHASE 6: ACTIVITY LOGS & NOTIFICATIONS
-- =============================================

-- =====================
-- ENUMS
-- =====================
create type public.log_level as enum ('info', 'warning', 'error', 'success');
create type public.notification_type as enum ('info', 'success', 'warning', 'error');

-- =====================
-- ACTIVITY LOGS TABLE
-- =====================
create table public.activity_logs (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid references public.organizations(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    level public.log_level default 'info',
    service text,
    action text not null,
    resource_type text,
    resource_id uuid,
    message text,
    details jsonb default '{}',
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone default now()
);

-- Indexes for activity_logs
create index idx_activity_logs_org on public.activity_logs(organization_id);
create index idx_activity_logs_org_created on public.activity_logs(organization_id, created_at desc);
create index idx_activity_logs_user on public.activity_logs(user_id);
create index idx_activity_logs_level on public.activity_logs(organization_id, level);
create index idx_activity_logs_service on public.activity_logs(organization_id, service);
create index idx_activity_logs_resource on public.activity_logs(resource_type, resource_id);

-- =====================
-- NOTIFICATIONS TABLE (with read_at timestamp)
-- =====================
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    organization_id uuid references public.organizations(id) on delete cascade,
    type public.notification_type default 'info',
    title text not null,
    message text,
    read_at timestamp with time zone, -- NULL = unread, timestamp = when read
    action_url text,
    resource_type text,
    resource_id uuid,
    created_at timestamp with time zone default now()
);

-- Indexes for notifications
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index idx_notifications_user_unread on public.notifications(user_id, created_at desc) where read_at is null;
create index idx_notifications_org on public.notifications(organization_id);

-- =====================
-- ENABLE RLS
-- =====================
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

-- =====================
-- RLS POLICIES: ACTIVITY LOGS
-- =====================

-- SELECT: Users can view logs in their org, admins can see all
create policy "Users can view org activity logs"
on public.activity_logs for select
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

-- INSERT: Users can create logs in their org
create policy "Users can create activity logs"
on public.activity_logs for insert
to authenticated
with check (
  organization_id = public.get_user_organization_id(auth.uid())
  or organization_id is null -- Allow system-level logs
);

-- No UPDATE or DELETE for activity logs (audit trail integrity)

-- =====================
-- RLS POLICIES: NOTIFICATIONS
-- =====================

-- SELECT: Users can only view their own notifications
create policy "Users can view their notifications"
on public.notifications for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'admin')
);

-- INSERT: Org admins can create notifications for org members
create policy "Org admins can create notifications"
on public.notifications for insert
to authenticated
with check (
  -- User creating notification for themselves
  user_id = auth.uid()
  -- Or admin creating for anyone
  or public.has_role(auth.uid(), 'admin')
  -- Or org admin creating for org member
  or (
    public.is_org_admin(auth.uid())
    and user_id in (
      select p.user_id from public.profiles p
      where p.organization_id = public.get_user_organization_id(auth.uid())
    )
  )
);

-- UPDATE: Users can only update (mark as read) their own notifications
create policy "Users can update their notifications"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- DELETE: Users can delete their own notifications
create policy "Users can delete their notifications"
on public.notifications for delete
to authenticated
using (user_id = auth.uid());

-- =====================
-- HELPER FUNCTION: Mark notification as read
-- =====================
create or replace function public.mark_notification_read(_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set read_at = now()
  where id = _notification_id
  and user_id = auth.uid()
  and read_at is null;
end;
$$;

-- =====================
-- HELPER FUNCTION: Mark all notifications as read
-- =====================
create or replace function public.mark_all_notifications_read()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
begin
  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
  and read_at is null;
  
  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- =====================
-- HELPER FUNCTION: Get unread notification count
-- =====================
create or replace function public.get_unread_notification_count()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.notifications
  where user_id = auth.uid()
  and read_at is null
$$;

-- =====================
-- HELPER FUNCTION: Log activity
-- =====================
create or replace function public.log_activity(
  _action text,
  _message text default null,
  _level public.log_level default 'info',
  _service text default null,
  _resource_type text default null,
  _resource_id uuid default null,
  _details jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _log_id uuid;
  _org_id uuid;
begin
  _org_id := public.get_user_organization_id(auth.uid());
  
  insert into public.activity_logs (
    organization_id,
    user_id,
    level,
    service,
    action,
    resource_type,
    resource_id,
    message,
    details
  ) values (
    _org_id,
    auth.uid(),
    _level,
    _service,
    _action,
    _resource_type,
    _resource_id,
    _message,
    _details
  )
  returning id into _log_id;
  
  return _log_id;
end;
$$;