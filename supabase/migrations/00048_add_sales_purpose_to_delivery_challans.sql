ALTER TABLE public.delivery_challans
  DROP CONSTRAINT IF EXISTS delivery_challans_purpose_check;

ALTER TABLE public.delivery_challans
  ADD CONSTRAINT delivery_challans_purpose_check
  CHECK (purpose IN ('job_work', 'return_after_job_work', 'repair', 'sample', 'branch_transfer', 'sales'));
