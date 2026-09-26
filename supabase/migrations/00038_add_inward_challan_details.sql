ALTER TABLE public.material_inventory_movements
  ADD COLUMN IF NOT EXISTS party_gstin text,
  ADD COLUMN IF NOT EXISTS party_address text,
  ADD COLUMN IF NOT EXISTS document_date date,
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS order_id text,
  ADD COLUMN IF NOT EXISTS purchase_order_date date,
  ADD COLUMN IF NOT EXISTS vehicle_number text,
  ADD COLUMN IF NOT EXISTS transporter_name text,
  ADD COLUMN IF NOT EXISTS eway_bill_number text,
  ADD COLUMN IF NOT EXISTS item_description text,
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS batch_number text,
  ADD COLUMN IF NOT EXISTS drawing_number text,
  ADD COLUMN IF NOT EXISTS drawing_revision text,
  ADD COLUMN IF NOT EXISTS amount numeric(12,2) NOT NULL DEFAULT 0;

NOTIFY pgrst, 'reload schema';
