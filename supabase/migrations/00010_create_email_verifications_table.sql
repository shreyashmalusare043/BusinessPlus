-- Create email_verifications table
create table if not exists email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  token text not null unique,
  verified boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  verified_at timestamptz
);

-- Create index for faster lookups
create index if not exists idx_email_verifications_token on email_verifications(token);
create index if not exists idx_email_verifications_user_id on email_verifications(user_id);
create index if not exists idx_email_verifications_email on email_verifications(email);

-- RLS policies
alter table email_verifications enable row level security;

-- Users can view their own verification records
create policy "Users can view own verifications"
  on email_verifications for select
  using (auth.uid() = user_id);

-- Service role can insert verification records
create policy "Service role can insert verifications"
  on email_verifications for insert
  with check (true);

-- Anyone can update verification status (for token verification)
create policy "Anyone can update verification status"
  on email_verifications for update
  using (true)
  with check (true);

-- Function to verify email token
create or replace function verify_email_token(verification_token text)
returns json
language plpgsql
security definer
as $$
declare
  v_record email_verifications;
  v_user_id uuid;
begin
  -- Find verification record
  select * into v_record
  from email_verifications
  where token = verification_token
    and verified = false
    and expires_at > now();
  
  if not found then
    return json_build_object(
      'success', false,
      'error', 'Invalid or expired verification token'
    );
  end if;
  
  -- Mark as verified
  update email_verifications
  set verified = true,
      verified_at = now()
  where token = verification_token;
  
  -- Update user metadata to mark email as verified
  update auth.users
  set email_confirmed_at = now(),
      raw_user_meta_data = raw_user_meta_data || json_build_object('email_verified', true)::jsonb
  where id = v_record.user_id;
  
  return json_build_object(
    'success', true,
    'message', 'Email verified successfully',
    'username', v_record.username
  );
end;
$$;