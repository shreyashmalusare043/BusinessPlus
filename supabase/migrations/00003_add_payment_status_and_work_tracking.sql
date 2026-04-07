-- Add payment status to bills
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid');

ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'pending';

-- Create work_logs table for daily work tracking
CREATE TABLE public.work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  work_type text NOT NULL CHECK (work_type IN ('outsource', 'inhouse')),
  company_name text NOT NULL,
  machine_hours numeric(5,2) NOT NULL CHECK (machine_hours >= 0 AND machine_hours <= 24),
  jobs_completed integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for work_logs
CREATE INDEX idx_work_logs_user_id ON work_logs(user_id);
CREATE INDEX idx_work_logs_log_date ON work_logs(log_date);

-- Enable RLS for work_logs
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

-- Work logs policies
CREATE POLICY "Users can view their own work logs" ON work_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work logs" ON work_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work logs" ON work_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work logs" ON work_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);