-- Create an admin invitation for test account
INSERT INTO public.invitations (email, role, invited_by, expires_at)
VALUES (
  'crowboy9798@gmail.com', 
  'admin'::app_role, 
  (SELECT id FROM auth.users WHERE email = 'tejifry@gmail.com' LIMIT 1),
  NOW() + INTERVAL '7 days'
);