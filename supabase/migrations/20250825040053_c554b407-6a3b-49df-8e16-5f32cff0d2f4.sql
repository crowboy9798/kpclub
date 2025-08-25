-- Insert admin role for the main admin user
INSERT INTO public.user_roles (user_id, role, approved_at)
SELECT p.id, 'admin'::app_role, now()
FROM public.profiles p
WHERE p.email = 'tejifry@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;