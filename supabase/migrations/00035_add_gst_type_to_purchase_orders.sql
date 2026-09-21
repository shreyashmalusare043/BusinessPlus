ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS gst_type text NOT NULL DEFAULT 'cgst_sgst';

ALTER TABLE public.purchase_orders
  DROP CONSTRAINT IF EXISTS purchase_orders_gst_type_check;

ALTER TABLE public.purchase_orders
  ADD CONSTRAINT purchase_orders_gst_type_check
  CHECK (gst_type IN ('cgst_sgst', 'igst'));

NOTIFY pgrst, 'reload schema';
