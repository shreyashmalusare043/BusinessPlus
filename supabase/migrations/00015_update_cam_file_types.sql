-- Update CAM projects table to support more file types
alter table cam_projects 
  drop constraint if exists cam_projects_file_type_check;

alter table cam_projects 
  add constraint cam_projects_file_type_check 
  check (file_type in ('DXF', 'STEP', 'DWG', 'PDF', 'JPG', 'PNG'));