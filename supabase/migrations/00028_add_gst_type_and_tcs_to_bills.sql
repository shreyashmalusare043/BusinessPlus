-- Add GST type and TCS fields to bills table
ALTER TABLE public.bills 
ADD COLUMN gst_type text NOT NULL DEFAULT 'cgst_sgst' CHECK (gst_type IN ('cgst_sgst', 'igst')),
ADD COLUMN total_igst numeric(12,2) NOT NULL DEFAULT 0,
ADD COLUMN tcs_applicable boolean NOT NULL DEFAULT false,
ADD COLUMN tcs_amount numeric(12,2) NOT NULL DEFAULT 0;

-- Add IGST fields to bill_items table
ALTER TABLE public.bill_items
ADD COLUMN igst_rate numeric(5,2) NOT NULL DEFAULT 0,
ADD COLUMN igst_amount numeric(12,2) NOT NULL DEFAULT 0;