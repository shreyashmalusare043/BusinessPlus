CREATE TABLE IF NOT EXISTS public.material_inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('in', 'out')),
  movement_date date NOT NULL DEFAULT CURRENT_DATE,
  item_name text NOT NULL,
  hsn_code text,
  quantity numeric(12,3) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL DEFAULT 'pcs',
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  party_name text,
  document_number text,
  document_type text,
  document_id uuid,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'challan', 'bill', 'purchase_order')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_inventory_movements_user_date
  ON public.material_inventory_movements(user_id, movement_date DESC);
CREATE INDEX IF NOT EXISTS idx_material_inventory_movements_item
  ON public.material_inventory_movements(user_id, item_name);

ALTER TABLE public.material_inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own material movements"
  ON public.material_inventory_movements FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own material movements"
  ON public.material_inventory_movements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own material movements"
  ON public.material_inventory_movements FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own material movements"
  ON public.material_inventory_movements FOR DELETE
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
