-- Fix contacts table RLS policy to explicitly require authentication
-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view org contacts" ON public.contacts;

-- Recreate with explicit authentication check
CREATE POLICY "Users can view org contacts" 
ON public.contacts 
FOR SELECT 
TO authenticated
USING (
  (deleted_at IS NULL) 
  AND (
    (organization_id = get_user_organization_id(auth.uid())) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Also update INSERT, UPDATE, DELETE policies to use TO authenticated for consistency
DROP POLICY IF EXISTS "Users can create org contacts" ON public.contacts;
CREATE POLICY "Users can create org contacts" 
ON public.contacts 
FOR INSERT 
TO authenticated
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Users can update org contacts" ON public.contacts;
CREATE POLICY "Users can update org contacts" 
ON public.contacts 
FOR UPDATE 
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete contacts" ON public.contacts;
CREATE POLICY "Admins can delete contacts" 
ON public.contacts 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));