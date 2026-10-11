alter table public.companies
  add column if not exists signature_url text,
  add column if not exists stamp_url text;
