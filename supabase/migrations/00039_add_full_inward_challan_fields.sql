ALTER TABLE public.material_inventory_movements
  ADD COLUMN IF NOT EXISTS customer_name text,
  ADD COLUMN IF NOT EXISTS customer_address text,
  ADD COLUMN IF NOT EXISTS customer_gstin text,
  ADD COLUMN IF NOT EXISTS customer_state text,
  ADD COLUMN IF NOT EXISTS customer_state_code text,
  ADD COLUMN IF NOT EXISTS job_work_supplier text,
  ADD COLUMN IF NOT EXISTS supplier_code text,
  ADD COLUMN IF NOT EXISTS supplier_gstin text,
  ADD COLUMN IF NOT EXISTS process_nature text,
  ADD COLUMN IF NOT EXISTS process_quantity numeric(12,3),
  ADD COLUMN IF NOT EXISTS process_rate numeric(12,2),
  ADD COLUMN IF NOT EXISTS process_value numeric(12,2),
  ADD COLUMN IF NOT EXISTS material_quantity numeric(12,3),
  ADD COLUMN IF NOT EXISTS material_rate numeric(12,2),
  ADD COLUMN IF NOT EXISTS material_value numeric(12,2),
  ADD COLUMN IF NOT EXISTS gst_rate numeric(5,2),
  ADD COLUMN IF NOT EXISTS expected_delivery_date date;

NOTIFY pgrst, 'reload schema';
