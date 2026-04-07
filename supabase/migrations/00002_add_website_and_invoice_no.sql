-- Add website field to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS website text;

-- Add invoice_no field to purchase_orders table
ALTER TABLE public.purchase_orders ADD COLUMN IF NOT EXISTS invoice_no text;