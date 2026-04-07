-- Add bill_template field to companies table
alter table companies 
  add column if not exists bill_template text default 'blue' check (bill_template in ('blue', 'orange', 'gray', 'purple'));