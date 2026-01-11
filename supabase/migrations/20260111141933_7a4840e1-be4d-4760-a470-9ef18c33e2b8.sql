-- Fix profiles table RLS policies to explicitly require authentication
DROP POLICY IF EXISTS "Users can view org profiles" ON public.profiles;
CREATE POLICY "Users can view org profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  (organization_id = get_user_organization_id(auth.uid())) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));