-- Create work orders table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  work_order_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  quantity_ordered DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_returned DECIMAL(10, 2) NOT NULL DEFAULT 0,
  outstanding_quantity DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_ordered - quantity_returned) STORED,
  work_start_date DATE NOT NULL,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, work_order_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_work_orders_user_id ON work_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_work_orders_dates ON work_orders(user_id, work_start_date, completion_date);

-- Enable RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own work orders
CREATE POLICY "Users can view own work orders"
  ON work_orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own work orders
CREATE POLICY "Users can create own work orders"
  ON work_orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own work orders
CREATE POLICY "Users can update own work orders"
  ON work_orders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own work orders
CREATE POLICY "Users can delete own work orders"
  ON work_orders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_work_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_work_orders_updated_at();

-- Add work_order_id to work_logs table for linking
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL;

-- Create index for work logs work order link
CREATE INDEX IF NOT EXISTS idx_work_logs_work_order_id ON work_logs(work_order_id);
