-- Allow sending a payment reminder immediately when a bill is saved.
alter table bills
  drop constraint if exists bills_payment_reminder_check;

alter table bills
  add constraint bills_payment_reminder_check
  check (payment_reminder in ('none', 'now', '7_days', '30_days', '45_days', '90_days'));