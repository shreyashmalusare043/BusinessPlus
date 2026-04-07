-- Create RPC function to update profile email
CREATE OR REPLACE FUNCTION update_profile_email(user_id UUID, new_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET email = new_email, updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;