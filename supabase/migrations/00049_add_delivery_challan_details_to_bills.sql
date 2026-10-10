alter table public.bills
  add column if not exists delivery_challan_no text,
  add column if not exists delivery_challan_date date;
