-- Add bank details fields to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_holder_name text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS ifsc_code text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS branch_name text;