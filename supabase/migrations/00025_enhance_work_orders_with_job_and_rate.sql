-- Add new fields to work_orders table
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS job_name TEXT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS rate_per_piece DECIMAL(10, 2) DEFAULT 0;

-- Add quantity_completed field to work_logs table
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS quantity_completed DECIMAL(10, 2) DEFAULT 0;

-- Create function to calculate total completed quantity for a work order
CREATE OR REPLACE FUNCTION calculate_work_order_completed_quantity(work_order_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_completed DECIMAL;
BEGIN
  SELECT COALESCE(SUM(quantity_completed), 0)
  INTO total_completed
  FROM work_logs
  WHERE work_order_id = work_order_id_param;
  
  RETURN total_completed;
END;
$$ LANGUAGE plpgsql;

-- Create function to update work order status based on completion
CREATE OR REPLACE FUNCTION update_work_order_status()
RETURNS TRIGGER AS $$
DECLARE
  total_completed DECIMAL;
  order_quantity DECIMAL;
  order_status TEXT;
BEGIN
  -- Get the work order details
  SELECT quantity_ordered, status
  INTO order_quantity, order_status
  FROM work_orders
  WHERE id = NEW.work_order_id;
  
  -- Calculate total completed quantity
  total_completed := calculate_work_order_completed_quantity(NEW.work_order_id);
  
  -- Update work order status based on completion
  IF total_completed >= order_quantity THEN
    -- Work is completed
    UPDATE work_orders
    SET status = 'completed',
        completion_date = CURRENT_DATE
    WHERE id = NEW.work_order_id AND status != 'completed';
  ELSIF total_completed > 0 AND order_status = 'pending' THEN
    -- Work has started
    UPDATE work_orders
    SET status = 'in_progress'
    WHERE id = NEW.work_order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update work order status when work log is inserted or updated
DROP TRIGGER IF EXISTS trigger_update_work_order_status ON work_logs;
CREATE TRIGGER trigger_update_work_order_status
  AFTER INSERT OR UPDATE OF quantity_completed ON work_logs
  FOR EACH ROW
  WHEN (NEW.work_order_id IS NOT NULL)
  EXECUTE FUNCTION update_work_order_status();

-- Create view to get work orders with completed quantities
CREATE OR REPLACE VIEW work_orders_with_progress AS
SELECT 
  wo.*,
  COALESCE(SUM(wl.quantity_completed), 0) AS quantity_completed,
  wo.quantity_ordered - COALESCE(SUM(wl.quantity_completed), 0) AS quantity_pending
FROM work_orders wo
LEFT JOIN work_logs wl ON wo.id = wl.work_order_id
GROUP BY wo.id;