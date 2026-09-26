ALTER TABLE public.material_inventory_movements
  ADD COLUMN IF NOT EXISTS eway_bill_date date;

NOTIFY pgrst, 'reload schema';
