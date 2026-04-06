-- Create function to update username
create or replace function update_username(new_username text, user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update profiles
  set username = new_username
  where id = user_id;
end;
$$;