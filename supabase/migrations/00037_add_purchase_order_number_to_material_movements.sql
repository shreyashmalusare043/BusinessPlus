ALTER TABLE public.material_inventory_movements
  ADD COLUMN IF NOT EXISTS purchase_order_number text;

NOTIFY pgrst, 'reload schema';
