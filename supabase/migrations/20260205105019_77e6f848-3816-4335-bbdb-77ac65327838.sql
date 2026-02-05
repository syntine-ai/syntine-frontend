-- Fix campaigns SELECT policy to allow soft-delete UPDATE to succeed
-- The RETURNING clause requires SELECT access, and the current policy filters out deleted rows
DROP POLICY IF EXISTS "Users can view org campaigns" ON public.campaigns;

CREATE POLICY "Users can view org campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (
  (organization_id = get_user_organization_id(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Also update DELETE policy to allow org members to soft-delete their campaigns
-- (The actual delete is done via UPDATE to set deleted_at, but hard DELETE should also work for org members)
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.campaigns;

CREATE POLICY "Users can delete org campaigns"
ON public.campaigns
FOR DELETE
TO authenticated
USING (
  (organization_id = get_user_organization_id(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);