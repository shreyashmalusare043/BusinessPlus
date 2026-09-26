ALTER TABLE public.outward_entries
  ADD COLUMN IF NOT EXISTS exception_status text NOT NULL DEFAULT 'completed'
    CHECK (exception_status IN ('completed', 'pending', 'in_process', 'rejected')),
  ADD COLUMN IF NOT EXISTS exception_remark text;

ALTER TABLE public.material_inventory_movements
  ADD COLUMN IF NOT EXISTS inventory_status text NOT NULL DEFAULT 'completed'
    CHECK (inventory_status IN ('completed', 'pending', 'in_process', 'rejected')),
  ADD COLUMN IF NOT EXISTS inventory_remark text,
  ADD COLUMN IF NOT EXISTS source_inward_id uuid REFERENCES public.material_inventory_movements(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS related_bill_id uuid REFERENCES public.bills(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_material_inventory_available
  ON public.material_inventory_movements(user_id, party_name, item_name, movement_type, inventory_status);

NOTIFY pgrst, 'reload schema';
