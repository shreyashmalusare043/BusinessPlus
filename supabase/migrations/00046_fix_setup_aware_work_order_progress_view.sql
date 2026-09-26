DROP VIEW IF EXISTS public.work_orders_with_progress;

CREATE VIEW public.work_orders_with_progress AS
SELECT
  wo.*,
  CASE
    WHEN wo.setup_count > 0 THEN COALESCE(MAX(wl.quantity_completed), 0)
    ELSE COALESCE(SUM(wl.quantity_completed), 0)
  END AS quantity_completed,
  wo.quantity_ordered - CASE
    WHEN wo.setup_count > 0 THEN COALESCE(MAX(wl.quantity_completed), 0)
    ELSE COALESCE(SUM(wl.quantity_completed), 0)
  END AS quantity_pending
FROM public.work_orders wo
LEFT JOIN public.work_logs wl ON wo.id = wl.work_order_id
GROUP BY wo.id;
