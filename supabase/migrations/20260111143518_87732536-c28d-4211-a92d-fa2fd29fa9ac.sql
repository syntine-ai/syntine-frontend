-- Fix profiles table email exposure by restricting full profile access
-- Users can only see full profile data if they are the owner or an admin
-- For listing team members, a separate secure view will be created

-- Update the SELECT policy to restrict full profile access
DROP POLICY IF EXISTS "Users can view org profiles" ON public.profiles;

-- Policy: Users can only see their own profile fully, or admins can see all
CREATE POLICY "Users can view own profile or admin" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  (user_id = auth.uid()) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_org_admin(auth.uid())
);

-- Create a secure function to get team member list without exposing emails
CREATE OR REPLACE FUNCTION public.get_org_team_members()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  organization_id uuid,
  timezone text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.organization_id,
    p.timezone,
    p.created_at
  FROM public.profiles p
  WHERE p.organization_id = get_user_organization_id(auth.uid())
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_org_team_members() TO authenticated;