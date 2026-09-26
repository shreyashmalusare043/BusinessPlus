CREATE OR REPLACE FUNCTION update_work_order_status()
RETURNS TRIGGER AS $$
DECLARE
  total_completed DECIMAL;
  order_quantity DECIMAL;
  order_status TEXT;
  setup_count_value INTEGER;
  linked_work_order_id UUID;
  completed_setups INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    linked_work_order_id := OLD.work_order_id;
  ELSE
    linked_work_order_id := NEW.work_order_id;
  END IF;

  SELECT quantity_ordered, status, setup_count
  INTO order_quantity, order_status, setup_count_value
  FROM work_orders
  WHERE id = linked_work_order_id;

  total_completed := calculate_work_order_completed_quantity(linked_work_order_id);

  SELECT COUNT(DISTINCT setup_number)
  INTO completed_setups
  FROM work_logs
  WHERE work_order_id = linked_work_order_id
    AND setup_number IS NOT NULL
    AND quantity_completed > 0;

  UPDATE work_orders
  SET setup_completed = completed_setups
  WHERE id = linked_work_order_id;

  IF setup_count_value > 0 AND completed_setups < setup_count_value THEN
    UPDATE work_orders
    SET status = CASE WHEN total_completed > 0 THEN 'in_progress' ELSE 'pending' END,
        completion_date = NULL
    WHERE id = linked_work_order_id;
  ELSIF total_completed >= order_quantity THEN
    UPDATE work_orders
    SET status = 'completed', completion_date = CURRENT_DATE
    WHERE id = linked_work_order_id;
  ELSIF total_completed > 0 THEN
    UPDATE work_orders
    SET status = 'in_progress', completion_date = NULL
    WHERE id = linked_work_order_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

UPDATE public.work_orders wo
SET setup_completed = progress.completed_setups,
    status = CASE
      WHEN wo.setup_count > 0 AND progress.completed_setups >= wo.setup_count
           AND progress.total_completed >= wo.quantity_ordered THEN 'completed'
      WHEN progress.total_completed > 0 THEN 'in_progress'
      ELSE 'pending'
    END,
    completion_date = CASE
      WHEN wo.setup_count > 0 AND progress.completed_setups >= wo.setup_count
           AND progress.total_completed >= wo.quantity_ordered THEN COALESCE(wo.completion_date, CURRENT_DATE)
      ELSE NULL
    END
FROM (
  SELECT
    wo_inner.id,
    COUNT(DISTINCT wl.setup_number) FILTER (WHERE wl.setup_number IS NOT NULL AND wl.quantity_completed > 0) AS completed_setups,
    CASE
      WHEN wo_inner.setup_count > 0 THEN COALESCE(MAX(wl.quantity_completed), 0)
      ELSE COALESCE(SUM(wl.quantity_completed), 0)
    END AS total_completed
  FROM public.work_orders wo_inner
  LEFT JOIN public.work_logs wl ON wl.work_order_id = wo_inner.id
  GROUP BY wo_inner.id, wo_inner.setup_count
) progress
WHERE wo.id = progress.id;
