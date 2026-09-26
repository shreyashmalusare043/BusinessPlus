ALTER TABLE public.delivery_challans
  ADD COLUMN IF NOT EXISTS vehicle_number text;
