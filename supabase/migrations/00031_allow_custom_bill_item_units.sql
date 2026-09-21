-- Allow standard and custom units on bill items.
ALTER TABLE public.bill_items
DROP CONSTRAINT IF EXISTS bill_items_unit_check;