-- Create expenses table for tracking business expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_name text not null,
  category text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  expense_date date not null default current_date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create index for faster queries
create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_expenses_date on public.expenses(expense_date);
create index if not exists idx_expenses_category on public.expenses(category);

-- Enable RLS
alter table public.expenses enable row level security;

-- RLS Policies: Users can only access their own expenses
create policy "Users can view their own expenses"
  on public.expenses
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own expenses"
  on public.expenses
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own expenses"
  on public.expenses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own expenses"
  on public.expenses
  for delete
  using (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
create or replace function public.update_expenses_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_expenses_updated_at
  before update on public.expenses
  for each row
  execute function public.update_expenses_updated_at();