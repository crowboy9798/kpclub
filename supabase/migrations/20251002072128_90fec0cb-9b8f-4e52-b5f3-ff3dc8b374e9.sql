-- Drop existing permissive RLS policies on KPC2
DROP POLICY IF EXISTS "Authenticated users can view members" ON public."KPC2";
DROP POLICY IF EXISTS "Authenticated users can insert members" ON public."KPC2";
DROP POLICY IF EXISTS "Authenticated users can update members" ON public."KPC2";
DROP POLICY IF EXISTS "Authenticated users can delete members" ON public."KPC2";

-- Create new restrictive RLS policies for admin and committee only
CREATE POLICY "Admin and committee can view members" 
ON public."KPC2"
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'committee'::app_role)
);

CREATE POLICY "Admin and committee can insert members" 
ON public."KPC2"
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'committee'::app_role)
);

CREATE POLICY "Admin and committee can update members" 
ON public."KPC2"
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'committee'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'committee'::app_role)
);

CREATE POLICY "Admin and committee can delete members" 
ON public."KPC2"
FOR DELETE 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'committee'::app_role)
);