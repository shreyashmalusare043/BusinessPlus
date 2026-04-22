-- Add status column to purchase_orders table
ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' NOT NULL;

-- Add comment
COMMENT ON COLUMN public.purchase_orders.status IS 'Status of purchase order: pending, confirmed, or revised';

-- Create constraint to ensure valid status values
ALTER TABLE public.purchase_orders
ADD CONSTRAINT purchase_orders_status_check CHECK (status IN ('pending', 'confirmed', 'revised'));
