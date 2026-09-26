CREATE TABLE IF NOT EXISTS public.inward_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inward_no text NOT NULL,
  document_type text NOT NULL DEFAULT 'job_work_challan',
  challan_no text,
  challan_date date,
  document_no text,
  document_date date,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_gstin text,
  customer_address text,
  customer_state text,
  customer_state_code text,
  supplier_name text,
  supplier_code text,
  supplier_gstin text,
  po_no text,
  po_date date,
  order_no text,
  order_id text,
  job_order_no text,
  job_order_item_no text,
  vehicle_no text,
  transporter text,
  eway_bill_no text,
  eway_bill_date date,
  received_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'verification_required' CHECK (status IN ('draft', 'processing', 'verification_required', 'received', 'in_process', 'ready_for_outward', 'partially_outward', 'completed', 'cancelled')),
  original_document_url text,
  extraction_status text NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, inward_no)
);

CREATE TABLE IF NOT EXISTS public.inward_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inward_id uuid NOT NULL REFERENCES inward_entries(id) ON DELETE CASCADE,
  stock_item_id uuid REFERENCES stock_items(id) ON DELETE SET NULL,
  product_name text,
  product_code text,
  description text NOT NULL,
  hsn_sac text,
  gst_rate numeric(5,2),
  lot_no text,
  lot_ref_no text,
  nature_of_process text,
  process_qty numeric(12,3),
  process_unit text,
  process_rate numeric(12,2),
  process_value numeric(12,2),
  material_qty numeric(12,3) NOT NULL CHECK (material_qty >= 0),
  material_unit text NOT NULL DEFAULT 'pcs',
  material_rate numeric(12,2),
  material_value numeric(12,2),
  drawing_no text,
  drawing_revision_no text,
  expected_delivery_date date,
  remarks text,
  received_qty numeric(12,3) NOT NULL DEFAULT 0,
  outward_qty numeric(12,3) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inward_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inward_id uuid NOT NULL REFERENCES inward_entries(id) ON DELETE CASCADE,
  bucket_id text NOT NULL DEFAULT 'inward-documents',
  object_path text NOT NULL,
  original_filename text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inward_extraction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inward_id uuid REFERENCES inward_entries(id) ON DELETE CASCADE,
  document_id uuid REFERENCES inward_documents(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'openai',
  model text,
  status text NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  raw_text text,
  extracted_json jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.outward_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  outward_no text NOT NULL,
  inward_id uuid NOT NULL REFERENCES inward_entries(id) ON DELETE RESTRICT,
  bill_id uuid REFERENCES bills(id) ON DELETE SET NULL,
  outward_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, outward_no)
);

CREATE TABLE IF NOT EXISTS public.outward_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outward_id uuid NOT NULL REFERENCES outward_entries(id) ON DELETE CASCADE,
  inward_item_id uuid NOT NULL REFERENCES inward_items(id) ON DELETE RESTRICT,
  quantity numeric(12,3) NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inward_entries_user_date ON inward_entries(user_id, received_date DESC);
CREATE INDEX IF NOT EXISTS idx_inward_items_inward_id ON inward_items(inward_id);
CREATE INDEX IF NOT EXISTS idx_outward_entries_user_date ON outward_entries(user_id, outward_date DESC);

ALTER TABLE inward_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inward_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE inward_extraction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outward_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE outward_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inward entries" ON inward_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inward entries" ON inward_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inward entries" ON inward_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inward entries" ON inward_entries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own inward items" ON inward_items FOR SELECT USING (EXISTS (SELECT 1 FROM inward_entries WHERE inward_entries.id = inward_items.inward_id AND inward_entries.user_id = auth.uid()));
CREATE POLICY "Users can insert own inward items" ON inward_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM inward_entries WHERE inward_entries.id = inward_items.inward_id AND inward_entries.user_id = auth.uid()));
CREATE POLICY "Users can update own inward items" ON inward_items FOR UPDATE USING (EXISTS (SELECT 1 FROM inward_entries WHERE inward_entries.id = inward_items.inward_id AND inward_entries.user_id = auth.uid()));
CREATE POLICY "Users can view own inward documents" ON inward_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inward documents" ON inward_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own extraction logs" ON inward_extraction_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own extraction logs" ON inward_extraction_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own outward entries" ON outward_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outward entries" ON outward_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outward entries" ON outward_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own outward items" ON outward_items FOR SELECT USING (EXISTS (SELECT 1 FROM outward_entries WHERE outward_entries.id = outward_items.outward_id AND outward_entries.user_id = auth.uid()));
CREATE POLICY "Users can insert own outward items" ON outward_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM outward_entries WHERE outward_entries.id = outward_items.outward_id AND outward_entries.user_id = auth.uid()));

NOTIFY pgrst, 'reload schema';
