CREATE TABLE IF NOT EXISTS public.cash_memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('cash_in', 'cash_out')),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  person_company_name text NOT NULL,
  purpose text NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  remark text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cash_memos_user_date ON public.cash_memos(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_cash_memos_type ON public.cash_memos(user_id, transaction_type);

ALTER TABLE public.cash_memos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cash memos" ON public.cash_memos
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cash memos" ON public.cash_memos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cash memos" ON public.cash_memos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cash memos" ON public.cash_memos
  FOR DELETE USING (auth.uid() = user_id);