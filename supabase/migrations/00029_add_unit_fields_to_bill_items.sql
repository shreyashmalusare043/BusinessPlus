-- Add unit fields to bill_items table
ALTER TABLE public.bill_items
ADD COLUMN unit text NOT NULL DEFAULT 'Nos' CHECK (unit IN ('Nos', 'Ltr', 'Kg'));