-- Check if the user exists and add admin role if missing
-- Note: This will insert admin role for the current authenticated user
-- We'll use a more flexible approach to handle this

-- First, let's ensure the current admin user has the proper role
-- We'll insert or update the role for the specific admin email

INSERT INTO public.user_roles (user_id, role, approved_at, invited_at)
SELECT 
    auth.users.id,
    'admin'::app_role,
    now(),
    now()
FROM auth.users 
WHERE auth.users.email = 'tejifry@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    role = 'admin'::app_role,
    approved_at = now(),
    updated_at = now();