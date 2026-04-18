-- Add classification and invoice_no columns to purchase_orders table
ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS invoice_no text,
ADD COLUMN IF NOT EXISTS classification text DEFAULT 'stock' NOT NULL;

-- Add comments
COMMENT ON COLUMN public.purchase_orders.invoice_no IS 'Supplier invoice number';
COMMENT ON COLUMN public.purchase_orders.classification IS 'Type of purchase order: stock or expense';

