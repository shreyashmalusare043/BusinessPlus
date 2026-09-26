ALTER TABLE public.work_orders
  ADD COLUMN IF NOT EXISTS setup_count integer NOT NULL DEFAULT 0
    CHECK (setup_count >= 0),
  ADD COLUMN IF NOT EXISTS setup_completed integer NOT NULL DEFAULT 0
    CHECK (setup_completed >= 0 AND setup_completed <= setup_count);

DROP VIEW IF EXISTS public.work_orders_with_progress;

CREATE VIEW public.work_orders_with_progress AS
SELECT
  wo.*,
  COALESCE(SUM(wl.quantity_completed), 0) AS quantity_completed,
  wo.quantity_ordered - COALESCE(SUM(wl.quantity_completed), 0) AS quantity_pending
FROM public.work_orders wo
LEFT JOIN public.work_logs wl ON wo.id = wl.work_order_id
GROUP BY wo.id;
