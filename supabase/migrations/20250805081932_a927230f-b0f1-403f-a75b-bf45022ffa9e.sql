-- Add committee role to the app_role enum
ALTER TYPE app_role ADD VALUE 'committee';

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'committee',
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for invitations
CREATE POLICY "Admins can manage all invitations" 
ON public.invitations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view invitations for their email" 
ON public.invitations 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Update the handle_new_user function to process invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    invite_record RECORD;
BEGIN
    -- Check if there's a valid invitation for this email
    SELECT * INTO invite_record
    FROM public.invitations
    WHERE email = NEW.email
      AND NOT used
      AND expires_at > now();

    IF invite_record.email IS NOT NULL THEN
        -- Valid invitation found
        INSERT INTO public.profiles (id, email, role)
        VALUES (NEW.id, NEW.email, 'user');
        
        INSERT INTO public.user_roles (user_id, role, invited_by, approved_at)
        VALUES (NEW.id, invite_record.role, invite_record.invited_by, now());
        
        -- Mark invitation as used
        UPDATE public.invitations
        SET used = TRUE, updated_at = now()
        WHERE id = invite_record.id;
        
    ELSIF NEW.email = 'tejifry@gmail.com' THEN
        -- Original admin account
        INSERT INTO public.profiles (id, email, role)
        VALUES (NEW.id, NEW.email, 'admin');
        
        INSERT INTO public.user_roles (user_id, role, approved_at)
        VALUES (NEW.id, 'admin', now());
        
    ELSE
        -- No invitation found - prevent signup
        RAISE EXCEPTION 'No valid invitation found for this email address';
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for automatic timestamp updates on invitations
CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();