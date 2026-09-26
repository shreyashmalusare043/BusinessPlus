-- Preserve three decimal places for bill quantities such as 0.220.
ALTER TABLE public.bill_items
ALTER COLUMN quantity TYPE numeric(12,3);