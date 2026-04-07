-- Add 'unpaid' to payment_status enum
alter type payment_status add value if not exists 'unpaid';

-- Add payment reminder field to bills table
alter table bills 
  add column if not exists payment_reminder text default 'none' check (payment_reminder in ('none', '7_days', '30_days', '45_days', '90_days')),
  add column if not exists last_reminder_sent_at timestamp with time zone,
  add column if not exists payment_confirmed_at timestamp with time zone,
  add column if not exists customer_email text;

-- Create index for payment reminder queries
create index if not exists idx_bills_payment_reminder on bills(payment_reminder, last_reminder_sent_at);