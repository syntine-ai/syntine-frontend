-- Drop the existing restrictive delete policy
DROP POLICY IF EXISTS "Admins can delete agents" ON public.agents;

-- Create a new policy that allows org members to delete their own org's agents
CREATE POLICY "Users can delete org agents"
ON public.agents
FOR DELETE
TO authenticated
USING (
  (organization_id = get_user_organization_id(auth.uid()))
  OR has_role(auth.uid(), 'admin'::app_role)
);