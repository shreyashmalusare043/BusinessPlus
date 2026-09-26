-- Add optional notes to bills with paragraph and bullet point formatting.
ALTER TABLE public.bills
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS notes_format text NOT NULL DEFAULT 'paragraph'
  CHECK (notes_format IN ('paragraph', 'bullet'));