-- Fix the RLS policy that's causing "permission denied for table users" error
-- The current policy tries to access auth.users directly which is not allowed

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can view invitations for their email" ON public.invitations;

-- Create a new policy that doesn't try to access auth.users table directly
-- Instead, we'll check if the user is admin (which is what we really want for invitation management)
CREATE POLICY "Admins and committee can view invitations" 
ON public.invitations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'committee'::app_role));

-- Also ensure all other operations are restricted to admins only
DROP POLICY IF EXISTS "Admins can manage all invitations" ON public.invitations;

CREATE POLICY "Admins can insert invitations" 
ON public.invitations 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update invitations" 
ON public.invitations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete invitations" 
ON public.invitations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));