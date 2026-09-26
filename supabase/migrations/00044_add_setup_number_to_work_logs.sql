ALTER TABLE public.work_logs
  ADD COLUMN IF NOT EXISTS setup_number integer
    CHECK (setup_number IS NULL OR setup_number > 0);

CREATE INDEX IF NOT EXISTS idx_work_logs_work_order_setup
  ON public.work_logs(work_order_id, setup_number);

CREATE OR REPLACE FUNCTION calculate_work_order_completed_quantity(work_order_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_completed DECIMAL;
  has_setup_logs BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM work_logs
    WHERE work_order_id = work_order_id_param
      AND setup_number IS NOT NULL
  ) INTO has_setup_logs;

  IF has_setup_logs THEN
    SELECT COALESCE(MAX(quantity_completed), 0)
    INTO total_completed
    FROM work_logs
    WHERE work_order_id = work_order_id_param;
  ELSE
    SELECT COALESCE(SUM(quantity_completed), 0)
    INTO total_completed
    FROM work_logs
    WHERE work_order_id = work_order_id_param;
  END IF;

  RETURN total_completed;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_work_order_status()
RETURNS TRIGGER AS $$
DECLARE
  total_completed DECIMAL;
  order_quantity DECIMAL;
  order_status TEXT;
  linked_work_order_id UUID;
  completed_setups INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    linked_work_order_id := OLD.work_order_id;
  ELSE
    linked_work_order_id := NEW.work_order_id;
  END IF;

  SELECT quantity_ordered, status
  INTO order_quantity, order_status
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

  IF total_completed >= order_quantity THEN
    UPDATE work_orders
    SET status = 'completed', completion_date = CURRENT_DATE
    WHERE id = linked_work_order_id AND status != 'completed';
  ELSIF total_completed > 0 AND order_status = 'pending' THEN
    UPDATE work_orders
    SET status = 'in_progress'
    WHERE id = linked_work_order_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_work_order_status ON public.work_logs;
CREATE TRIGGER trigger_update_work_order_status
  AFTER INSERT OR UPDATE OF quantity_completed, setup_number OR DELETE ON public.work_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_work_order_status();
