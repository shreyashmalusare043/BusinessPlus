ALTER TABLE public.bills
ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;