-- =============================================
-- PHASE 1: CORE TABLES FOR SYNTINE
-- Organizations, Profiles, User Roles
-- =============================================

-- =====================
-- ENUMS
-- =====================
create type public.organization_plan as enum ('starter', 'pro', 'enterprise');
create type public.organization_status as enum ('active', 'trial', 'suspended', 'cancelled');
create type public.app_role as enum ('admin', 'org_owner', 'org_admin', 'org_member');

-- =====================
-- ORGANIZATIONS TABLE
-- =====================
create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    domain text,
    email text,
    plan public.organization_plan not null default 'starter',
    status public.organization_status not null default 'trial',
    trial_ends_at timestamp with time zone default (now() + interval '14 days'),
    next_billing_date date,
    settings jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- =====================
-- PROFILES TABLE (organization_id NOT NULL)
-- =====================
create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null unique,
    organization_id uuid references public.organizations(id) on delete cascade not null,
    first_name text,
    last_name text,
    email text,
    avatar_url text,
    timezone text default 'UTC',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Normalized email index for fast lookups
create index idx_profiles_email_lower on public.profiles(lower(email));
create index idx_profiles_organization on public.profiles(organization_id);
create index idx_profiles_user on public.profiles(user_id);

-- =====================
-- USER ROLES TABLE (Separate for security)
-- =====================
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role public.app_role not null,
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

create index idx_user_roles_user on public.user_roles(user_id);

-- =====================
-- SECURITY DEFINER FUNCTIONS
-- =====================

-- Check if user has a specific role
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Get user's organization ID
create or replace function public.get_user_organization_id(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where user_id = _user_id
$$;

-- Check if user is org owner or admin
create or replace function public.is_org_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id 
    and role in ('org_owner', 'org_admin', 'admin')
  )
$$;

-- =====================
-- ENABLE RLS
-- =====================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- =====================
-- RLS POLICIES: ORGANIZATIONS
-- =====================

-- SELECT: Users can view their own organization
create policy "Users can view their organization"
on public.organizations for select
to authenticated
using (
  id = public.get_user_organization_id(auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

-- INSERT: Only platform admins can create organizations directly
-- (normal users create via signup flow with edge function)
create policy "Admins can create organizations"
on public.organizations for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'admin')
);

-- UPDATE: Org owners/admins can update their organization
create policy "Org admins can update their organization"
on public.organizations for update
to authenticated
using (
  id = public.get_user_organization_id(auth.uid())
  and public.is_org_admin(auth.uid())
)
with check (
  id = public.get_user_organization_id(auth.uid())
);

-- DELETE: Only platform admins can delete organizations
create policy "Admins can delete organizations"
on public.organizations for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- =====================
-- RLS POLICIES: PROFILES
-- =====================

-- SELECT: Users can view profiles in their organization
create policy "Users can view org profiles"
on public.profiles for select
to authenticated
using (
  organization_id = public.get_user_organization_id(auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

-- INSERT: Service role handles profile creation on signup
-- Allow insert for users creating their own profile
create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check (
  user_id = auth.uid()
);

-- UPDATE: Users can update their own profile
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- DELETE: Only platform admins can delete profiles
create policy "Admins can delete profiles"
on public.profiles for delete
to authenticated
using (
  public.has_role(auth.uid(), 'admin')
);

-- =====================
-- RLS POLICIES: USER ROLES
-- =====================

-- SELECT: Users can view roles in their organization
create policy "Users can view org roles"
on public.user_roles for select
to authenticated
using (
  user_id in (
    select p.user_id from public.profiles p
    where p.organization_id = public.get_user_organization_id(auth.uid())
  )
  or public.has_role(auth.uid(), 'admin')
);

-- INSERT: Only org owners/admins can assign roles
create policy "Org admins can assign roles"
on public.user_roles for insert
to authenticated
with check (
  public.is_org_admin(auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

-- UPDATE: Only org owners/admins can modify roles
create policy "Org admins can update roles"
on public.user_roles for update
to authenticated
using (
  public.is_org_admin(auth.uid())
  or public.has_role(auth.uid(), 'admin')
)
with check (
  public.is_org_admin(auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

-- DELETE: Only org owners/admins can remove roles
create policy "Org admins can delete roles"
on public.user_roles for delete
to authenticated
using (
  public.is_org_admin(auth.uid())
  or public.has_role(auth.uid(), 'admin')
);

-- =====================
-- TRIGGERS: Auto-update timestamps
-- =====================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tr_organizations_updated
  before update on public.organizations
  for each row execute function public.update_updated_at();

create trigger tr_profiles_updated
  before update on public.profiles
  for each row execute function public.update_updated_at();