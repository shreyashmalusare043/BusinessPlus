-- CAM Materials Table
create table if not exists cam_materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cutting_speed_range text,
  feed_rate_range text,
  properties jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- CAM Machines Table
create table if not exists cam_machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  max_diameter numeric,
  max_length numeric,
  capabilities jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- CAM Tools Table
create table if not exists cam_tools (
  id uuid primary key default gen_random_uuid(),
  tool_name text not null,
  tool_type text not null,
  material_compatibility text[] default array[]::text[],
  operation_type text not null,
  cutting_speed numeric,
  feed_rate numeric,
  depth_of_cut numeric,
  description text,
  created_at timestamp with time zone default now()
);

-- CAM Projects Table
create table if not exists cam_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_name text not null,
  file_name text not null,
  file_url text not null,
  file_type text not null check (file_type in ('DXF', 'STEP')),
  material text not null,
  machine_type text not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'completed', 'failed')),
  analysis_data jsonb default '{}'::jsonb,
  gcode_url text,
  setup_sheet_url text,
  error_message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- CAM Operations Table
create table if not exists cam_operations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references cam_projects(id) on delete cascade,
  operation_sequence integer not null,
  operation_type text not null,
  tool_id uuid references cam_tools(id),
  parameters jsonb default '{}'::jsonb,
  gcode_snippet text,
  created_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_cam_projects_user_id on cam_projects(user_id);
create index if not exists idx_cam_projects_status on cam_projects(status);
create index if not exists idx_cam_operations_project_id on cam_operations(project_id);

-- RLS Policies for cam_projects
alter table cam_projects enable row level security;

create policy "Users can view own CAM projects"
  on cam_projects for select
  using (auth.uid() = user_id);

create policy "Users can create own CAM projects"
  on cam_projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own CAM projects"
  on cam_projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own CAM projects"
  on cam_projects for delete
  using (auth.uid() = user_id);

-- RLS Policies for cam_operations
alter table cam_operations enable row level security;

create policy "Users can view operations for own projects"
  on cam_operations for select
  using (exists (
    select 1 from cam_projects
    where cam_projects.id = cam_operations.project_id
    and cam_projects.user_id = auth.uid()
  ));

create policy "Users can create operations for own projects"
  on cam_operations for insert
  with check (exists (
    select 1 from cam_projects
    where cam_projects.id = cam_operations.project_id
    and cam_projects.user_id = auth.uid()
  ));

-- Public read access for materials, machines, and tools
alter table cam_materials enable row level security;
alter table cam_machines enable row level security;
alter table cam_tools enable row level security;

create policy "Anyone can view materials"
  on cam_materials for select
  using (true);

create policy "Anyone can view machines"
  on cam_machines for select
  using (true);

create policy "Anyone can view tools"
  on cam_tools for select
  using (true);

-- Insert sample data for materials
insert into cam_materials (name, description, cutting_speed_range, feed_rate_range, properties) values
('MS (Mild Steel)', 'General purpose carbon steel', '80-120 m/min', '0.1-0.3 mm/rev', '{"hardness": "120-180 HB", "machinability": "good"}'),
('SS304 (Stainless Steel)', 'Austenitic stainless steel', '60-100 m/min', '0.08-0.25 mm/rev', '{"hardness": "150-200 HB", "machinability": "moderate"}'),
('Aluminum', 'Lightweight non-ferrous metal', '200-400 m/min', '0.15-0.4 mm/rev', '{"hardness": "20-150 HB", "machinability": "excellent"}'),
('Brass', 'Copper-zinc alloy', '150-250 m/min', '0.1-0.35 mm/rev', '{"hardness": "50-150 HB", "machinability": "excellent"}'),
('Cast Iron', 'Iron-carbon alloy', '70-110 m/min', '0.1-0.3 mm/rev', '{"hardness": "150-250 HB", "machinability": "good"}');

-- Insert sample data for machines
insert into cam_machines (name, type, max_diameter, max_length, capabilities) values
('CNC Lathe', 'turning', 300, 1000, '{"threading": true, "grooving": true, "drilling": true}'),
('CNC Mill', 'milling', 500, 400, '{"3axis": true, "drilling": true, "tapping": true}'),
('CNC Turning Center', 'turning', 400, 1500, '{"threading": true, "grooving": true, "drilling": true, "live_tooling": true}');

-- Insert sample data for tools
insert into cam_tools (tool_name, tool_type, material_compatibility, operation_type, cutting_speed, feed_rate, depth_of_cut, description) values
('CNMG 120408', 'Turning Insert', array['MS', 'SS304', 'Cast Iron'], 'roughing', 180, 0.25, 2.0, 'General purpose roughing insert'),
('CNMG 120404', 'Turning Insert', array['MS', 'SS304', 'Aluminum'], 'finishing', 220, 0.15, 0.5, 'Finishing insert for smooth surface'),
('DCMT 11T304', 'Turning Insert', array['Aluminum', 'Brass'], 'finishing', 300, 0.2, 1.0, 'Sharp edge insert for non-ferrous materials'),
('Threading Insert 60°', 'Threading Insert', array['MS', 'SS304', 'Aluminum'], 'threading', 800, 2.0, 0.2, 'Metric threading insert'),
('Grooving Insert 3mm', 'Grooving Insert', array['MS', 'SS304'], 'grooving', 100, 0.1, 3.0, 'Parting and grooving insert');

-- Create storage bucket for CAM files
insert into storage.buckets (id, name, public) values ('cam-files', 'cam-files', false);

-- Storage policies for cam-files bucket
create policy "Users can upload own CAM files"
  on storage.objects for insert
  with check (bucket_id = 'cam-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own CAM files"
  on storage.objects for select
  using (bucket_id = 'cam-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own CAM files"
  on storage.objects for delete
  using (bucket_id = 'cam-files' and auth.uid()::text = (storage.foldername(name))[1]);