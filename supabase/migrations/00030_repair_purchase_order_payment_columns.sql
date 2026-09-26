-- Ensure the purchase order payment fields exist even when earlier migrations
-- were applied out of order or the remote migration history was incomplete.
ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid';

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.purchase_orders'::regclass
      AND conname = 'purchase_orders_payment_status_check'
  ) THEN
    ALTER TABLE public.purchase_orders
      ADD CONSTRAINT purchase_orders_payment_status_check
      CHECK (payment_status IN ('paid', 'unpaid'));
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';