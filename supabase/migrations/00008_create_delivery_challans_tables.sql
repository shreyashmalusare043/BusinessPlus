-- Create delivery_challans table
CREATE TABLE IF NOT EXISTS delivery_challans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challan_no TEXT NOT NULL,
  challan_date DATE NOT NULL,
  place_of_supply TEXT NOT NULL,
  party_name TEXT NOT NULL,
  party_address TEXT,
  party_gst TEXT,
  party_state TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('job_work', 'return_after_job_work', 'repair', 'sample', 'branch_transfer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create delivery_challan_items table
CREATE TABLE IF NOT EXISTS delivery_challan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challan_id UUID NOT NULL REFERENCES delivery_challans(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  hsn_code TEXT,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'Nos',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_delivery_challans_user_id ON delivery_challans(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_challans_challan_no ON delivery_challans(challan_no);
CREATE INDEX IF NOT EXISTS idx_delivery_challan_items_challan_id ON delivery_challan_items(challan_id);

-- RLS Policies for delivery_challans
ALTER TABLE delivery_challans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challans"
  ON delivery_challans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challans"
  ON delivery_challans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challans"
  ON delivery_challans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challans"
  ON delivery_challans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for delivery_challan_items
ALTER TABLE delivery_challan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challan items"
  ON delivery_challan_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM delivery_challans
      WHERE delivery_challans.id = delivery_challan_items.challan_id
      AND delivery_challans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own challan items"
  ON delivery_challan_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM delivery_challans
      WHERE delivery_challans.id = delivery_challan_items.challan_id
      AND delivery_challans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own challan items"
  ON delivery_challan_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM delivery_challans
      WHERE delivery_challans.id = delivery_challan_items.challan_id
      AND delivery_challans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own challan items"
  ON delivery_challan_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM delivery_challans
      WHERE delivery_challans.id = delivery_challan_items.challan_id
      AND delivery_challans.user_id = auth.uid()
    )
  );