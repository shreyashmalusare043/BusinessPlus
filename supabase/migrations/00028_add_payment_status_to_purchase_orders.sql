ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid'
CHECK (payment_status IN ('paid', 'unpaid'));

ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;