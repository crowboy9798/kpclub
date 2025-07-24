-- Fix the search_path security issue for the functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow the specific admin email
  IF NEW.email = 'tejifry@gmail.com' THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'admin');
  ELSE
    -- Prevent unauthorized signups by raising an exception
    RAISE EXCEPTION 'Unauthorized email address';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;