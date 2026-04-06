-- Add po_number field to bills table
alter table bills add column if not exists po_number text;