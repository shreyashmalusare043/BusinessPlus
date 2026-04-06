-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function to sync user data with username only
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  user_role user_role;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- First user is admin, rest are regular users
  IF user_count = 0 THEN
    user_role := 'admin'::user_role;
  ELSE
    user_role := 'user'::user_role;
  END IF;
  
  -- Insert profile with data from auth.users
  INSERT INTO public.profiles (
    id, 
    email, 
    username,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    user_role
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires when user is confirmed (email verified)
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Add comment
COMMENT ON FUNCTION handle_new_user IS 'Syncs user data from auth.users to profiles table when email is confirmed';
