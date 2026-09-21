ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS total_igst numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE public.purchase_order_items
  ADD COLUMN IF NOT EXISTS igst_rate numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS igst_amount numeric(12,2) NOT NULL DEFAULT 0;

NOTIFY pgrst, 'reload schema';
