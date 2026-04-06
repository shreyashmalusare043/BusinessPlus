# InvoxaPro AI-CAM Module Implementation Plan

## Overview
This document outlines the implementation plan for adding an AI-powered Computer-Aided Manufacturing (CAM) module to InvoxaPro. This module will convert 2D/3D engineering drawings into CNC machining programs.

## ⚠️ Important Notice
**This is a MAJOR feature addition that requires specialized CAM expertise.** The implementation provided here is a **framework/skeleton** that includes:
- Database structure
- UI components
- File upload handling
- Basic project management

**What is NOT included (requires CAM specialists):**
- DXF/STEP file parsing algorithms
- Geometry analysis and feature recognition
- AI-based process planning
- Toolpath calculation algorithms
- G-Code generation engine
- 3D visualization rendering

## Phase 1: Database Structure

### Tables Required:

#### 1. `cam_projects`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- project_name (text)
- file_name (text)
- file_url (text) -- Supabase Storage URL
- file_type (text) -- 'DXF' or 'STEP'
- material (text) -- 'MS', 'SS304', 'Aluminum', etc.
- machine_type (text) -- 'CNC Lathe', 'CNC Mill', etc.
- status (text) -- 'uploaded', 'processing', 'completed', 'failed'
- analysis_data (jsonb) -- Extracted dimensions and features
- gcode_url (text) -- Generated G-code file URL
- setup_sheet_url (text) -- Setup sheet PDF URL
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. `cam_materials`
```sql
- id (uuid, primary key)
- name (text) -- 'MS', 'SS304', 'Aluminum'
- description (text)
- cutting_speed_range (text) -- '80-120 m/min'
- feed_rate_range (text) -- '0.1-0.3 mm/rev'
- properties (jsonb) -- Additional material properties
```

#### 3. `cam_machines`
```sql
- id (uuid, primary key)
- name (text) -- 'CNC Lathe', 'CNC Mill'
- type (text) -- 'turning', 'milling'
- max_diameter (numeric)
- max_length (numeric)
- capabilities (jsonb) -- Threading, grooving, etc.
```

#### 4. `cam_tools`
```sql
- id (uuid, primary key)
- tool_name (text) -- 'CNMG 120408'
- tool_type (text) -- 'Turning Insert', 'End Mill'
- material_compatibility (text[]) -- ['MS', 'SS304']
- operation_type (text) -- 'roughing', 'finishing', 'threading'
- cutting_speed (numeric)
- feed_rate (numeric)
- depth_of_cut (numeric)
```

#### 5. `cam_operations`
```sql
- id (uuid, primary key)
- project_id (uuid, foreign key to cam_projects)
- operation_sequence (integer)
- operation_type (text) -- 'facing', 'roughing', 'finishing', 'threading'
- tool_id (uuid, foreign key to cam_tools)
- parameters (jsonb) -- Speed, feed, depth
- gcode_snippet (text)
```

## Phase 2: UI Components

### Pages to Create:

1. **CAM Projects List Page** (`/cam/projects`)
   - List all CAM projects
   - Upload new project button
   - View/Edit/Delete actions

2. **Create CAM Project Page** (`/cam/create`)
   - File upload (DXF/STEP)
   - Material selection dropdown
   - Machine type selection
   - Submit for processing

3. **CAM Project Detail Page** (`/cam/projects/:id`)
   - Project information
   - Analysis results (dimensions, features)
   - Operation sequence
   - Toolpath preview (canvas/3D viewer)
   - Download G-code button
   - Download setup sheet button

4. **CAM Settings Page** (`/cam/settings`)
   - Manage materials
   - Manage machines
   - Manage tools/inserts

## Phase 3: File Processing Workflow

### Step 1: File Upload
```typescript
// User uploads DXF/STEP file
// Store in Supabase Storage bucket 'cam-files'
// Create project record with status 'uploaded'
```

### Step 2: Geometry Analysis (REQUIRES CAM LIBRARY)
```typescript
// Parse DXF/STEP file
// Extract profile coordinates
// Identify features (shoulders, grooves, threads, holes)
// Calculate dimensions (length, diameter)
// Store in analysis_data JSON field
```

### Step 3: Process Planning (REQUIRES AI/ML)
```typescript
// Based on material + features + machine type
// Determine operation sequence
// Select appropriate tools for each operation
// Calculate cutting parameters (speed, feed, depth)
// Store in cam_operations table
```

### Step 4: G-Code Generation (REQUIRES CAM ENGINE)
```typescript
// For each operation:
//   - Calculate toolpath coordinates
//   - Generate G-code blocks
//   - Add M-codes for machine functions
// Combine into complete NC program
// Save to Supabase Storage
```

### Step 5: Setup Sheet Generation
```typescript
// Create PDF with:
//   - Part drawing/preview
//   - Tool list with offsets
//   - Operation sequence
//   - Material and machine info
// Save to Supabase Storage
```

## Phase 4: Required Libraries

### For File Parsing:
- **DXF Files**: `dxf-parser` (npm package)
- **STEP Files**: `opencascade.js` (WebAssembly port of OpenCascade)

### For Geometry Processing:
- **2D Geometry**: `paper.js` or `maath`
- **3D Geometry**: `three.js` for visualization

### For G-Code Generation:
- Custom implementation based on CNC standards
- Reference: ISO 6983 (G-code standard)

### For Visualization:
- **2D Toolpath**: HTML5 Canvas or `paper.js`
- **3D Toolpath**: `three.js` with `OrbitControls`

## Phase 5: Implementation Priority

### Priority 1 (Basic Framework):
✅ Database tables
✅ UI pages for project management
✅ File upload to Supabase Storage
✅ Basic project CRUD operations

### Priority 2 (File Processing):
⚠️ DXF file parsing (requires dxf-parser)
⚠️ Basic geometry extraction
⚠️ Manual operation planning (user selects operations)

### Priority 3 (AI Features):
⚠️ Automatic feature recognition
⚠️ AI-based process planning
⚠️ Tool recommendation engine

### Priority 4 (Advanced):
⚠️ STEP file support (3D)
⚠️ 3D toolpath visualization
⚠️ Simulation and collision detection
⚠️ Post-processor for different CNC controllers

## Technical Challenges

### 1. File Format Complexity
- DXF files can have hundreds of entity types
- STEP files are even more complex (3D solid models)
- Requires robust parsing libraries

### 2. Feature Recognition
- Identifying shoulders, grooves, threads from geometry
- Requires computer vision or pattern matching algorithms
- May need machine learning models

### 3. Process Planning
- Determining optimal operation sequence
- Selecting appropriate tools and parameters
- Requires extensive CNC machining knowledge

### 4. G-Code Generation
- Different CNC controllers use different dialects
- Need post-processors for Fanuc, Siemens, Haas, etc.
- Coordinate system transformations

### 5. Toolpath Calculation
- Avoiding collisions
- Optimizing for minimum cycle time
- Ensuring surface finish requirements

## Recommended Approach

### Option A: Build from Scratch
- **Pros**: Full control, custom features
- **Cons**: 6-12 months development time, requires CAM experts
- **Cost**: High (specialized developers)

### Option B: Integrate Existing CAM Engine
- **Pros**: Faster implementation, proven algorithms
- **Cons**: Licensing costs, less customization
- **Examples**: 
  - FreeCAD (open source, Python-based)
  - OpenCAMLib (open source C++ library)
  - Commercial APIs (expensive)

### Option C: Hybrid Approach (RECOMMENDED)
- Build UI and project management in React
- Use Edge Functions to call external CAM service
- Integrate with open-source CAM libraries via API
- Start with simple 2D turning operations
- Gradually add more features

## Sample G-Code Template

```gcode
%
O0001 (PART NAME: SHAFT-001)
(MATERIAL: SS304)
(MACHINE: CNC LATHE)
(PROGRAMMER: AI-CAM)
(DATE: 2026-03-21)

(TOOL LIST)
(T01 - CNMG 120408 - ROUGH TURNING)
(T02 - CNMG 120404 - FINISH TURNING)
(T03 - THREADING INSERT)

(OPERATION 1: FACING)
N10 G28 U0 W0 (HOME POSITION)
N20 T0101 (TOOL 1 - ROUGH)
N30 G96 S180 M03 (CSS 180 M/MIN, SPINDLE ON)
N40 M08 (COOLANT ON)
N50 G00 X52.0 Z2.0 (RAPID TO START)
N60 G01 Z-0.5 F0.15 (FACE END)
N70 G00 X100.0 Z100.0 (RETRACT)
N80 M09 (COOLANT OFF)

(OPERATION 2: ROUGH TURNING)
N90 G71 U2.0 R0.5 (ROUGHING CYCLE)
N100 G71 P110 Q200 U0.5 W0.1 F0.25
N110 G00 X20.0 (PROFILE START)
N120 G01 Z-50.0 (STRAIGHT SECTION)
N130 G01 X30.0 Z-55.0 (TAPER)
N140 G01 Z-100.0 (STRAIGHT SECTION)
N200 G01 X50.0 (PROFILE END)

(OPERATION 3: FINISH TURNING)
N210 T0202 (TOOL 2 - FINISH)
N220 G96 S220 M03
N230 M08
N240 G70 P110 Q200 (FINISH PROFILE)
N250 M09

(OPERATION 4: THREADING)
N260 T0303 (TOOL 3 - THREAD)
N270 G97 S800 M03 (RPM MODE)
N280 M08
N290 G76 P020060 Q100 R50 (THREAD CYCLE)
N300 G76 X28.5 Z-80.0 P1443 Q800 F2.0 (M30x2.0)
N310 M09

(END OF PROGRAM)
N320 G28 U0 W0
N330 M05 (SPINDLE OFF)
N340 M30 (PROGRAM END)
%
```

## Next Steps

1. **Decide on approach** (Build vs Buy vs Hybrid)
2. **Create database migrations** for CAM tables
3. **Build UI pages** for project management
4. **Implement file upload** to Supabase Storage
5. **Research and select** CAM libraries
6. **Prototype** simple 2D turning operation
7. **Test** with real CNC machine
8. **Iterate** and add more features

## Estimated Timeline

- **Phase 1 (Framework)**: 1-2 weeks
- **Phase 2 (Basic CAM)**: 4-6 weeks
- **Phase 3 (AI Features)**: 8-12 weeks
- **Phase 4 (Advanced)**: 12-16 weeks

**Total**: 6-9 months for full implementation

## Budget Estimate

- **Developer Time**: $50,000 - $100,000
- **CAM Libraries/APIs**: $5,000 - $20,000/year
- **Testing Equipment**: $10,000 - $30,000
- **Total**: $65,000 - $150,000

## Conclusion

This is a **highly specialized feature** that requires:
- CAM domain expertise
- Advanced geometry algorithms
- CNC programming knowledge
- Extensive testing

**Recommendation**: Start with a **basic prototype** for simple turning operations, validate with users, then expand based on feedback.
