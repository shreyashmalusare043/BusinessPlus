-- Update handle_new_user function to use username from metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  username_value text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Get username from user metadata (raw_user_meta_data)
  username_value := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1) -- Fallback to email prefix if no username in metadata
  );
  
  -- Insert a profile synced with fields collected at signup
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    username_value,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END;
$$;