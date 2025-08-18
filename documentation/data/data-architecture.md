# VP Product Onboarding System - Complete Implementation Guide
*For AI UI Engineer Implementation*

## 📊 Current Database State Analysis

### ✅ **IMPLEMENTED TABLES (12 tables)**

#### **Core Hierarchy Tables**
1. **`phases`** - Strategic onboarding phases (5 records)
2. **`initiatives`** - Week-level work groupings (5 records) 
3. **`tasks`** - Individual work items with hierarchy (32 records)
4. **`meetings`** - Scheduled meetings with templates (3 sample records)

#### **People & Organization Tables**
5. **`people`** - Team members and stakeholders (8 records)
6. **`departments`** - Organizational departments (12 records)
7. **`meeting_types`** - Meeting templates with JSONB structures (14 types)

#### **Many-to-Many Junction Tables**
8. **`initiative_workstreams`** - Multi-select workstreams per initiative
9. **`task_workstreams`** - Multi-select workstreams per task  
10. **`task_people`** - People involved in tasks with roles
11. **`meeting_attendees`** - Meeting participants with roles/status
12. **`workstreams`** - Strategic focus areas (4 workstreams)

### ❌ **MISSING CRITICAL TABLES**

#### **High Priority Missing Tables**
1. **`metrics_baseline`** - Success metrics tracking (CRITICAL)
2. **`decision_points`** - Key go/no-go moments (HIGH)
3. **`constraints`** - External factors/holidays (MEDIUM)

---

## 🏗️ **Complete Data Architecture**

### **Primary Data Flow Hierarchy**
```
PHASES (Strategic Level)
├── success_checkpoints (JSONB)
├── key_milestones (JSONB) 
├── phase_outcomes (JSONB)
└── working_days

    ↓ Contains (1:M)
    
INITIATIVES (Weekly Work Groups)
├── Week 1: Internal Foundation
├── Week 2: Domain & Cross-Functional  
├── Week 3: Integration & First Value
└── Ongoing: Intelligence & Documentation

    ↓ Contains (1:M)
    
TASKS (Individual Work Items)
├── Parent Tasks (e.g., "Documentation Archaeology")
├── Subtasks (e.g., "Review Q3 OKRs")
└── Action Items (source_meeting_id NOT NULL)

    ↓ References
    
MEETINGS (Structured Conversations)
├── template_data (JSONB) - Pre-meeting plan
├── structured_notes (JSONB) - Agenda responses  
├── unstructured_notes (TEXT) - Transcriptions
└── free_form_insights (TEXT) - Random observations
```

### **Cross-Cutting Relationships**
- **People**: Can own/be involved in tasks, attend meetings
- **Workstreams**: Can span multiple initiatives/tasks (M:M)
- **Meeting Types**: Template source for meeting structure
- **Departments**: Organizational context for people

---

## 📋 **Detailed Table Specifications**

### **1. PHASES Table**
```sql
phase_id SERIAL PRIMARY KEY
phase_name VARCHAR(100) -- "Foundation", "Diagnosis & Quick Wins"
phase_number INT -- 1, 2, 3, 4, 5
start_date DATE -- 2025-09-15
end_date DATE -- 2025-10-05 (NULL for ongoing)
start_week INT GENERATED -- Auto-calculated from dates
end_week INT GENERATED -- Auto-calculated from dates
learning_percentage INT -- 80, 60, 40, 30, 20
value_percentage INT -- 20, 40, 60, 70, 80
working_days INT -- 15 working days
success_checkpoints JSONB -- Complex success criteria
key_milestones JSONB -- DEPRECATED: Milestone data now in tasks table
constraints_notes TEXT -- Holiday considerations
phase_outcomes JSONB -- Expected results
```

**Key Features:**
- Auto-calculated week numbers from project start (2025-09-15)
- Rich JSONB for complex planning data
- Learning/Value percentage progression
- **IMPORTANT**: `key_milestones` field is deprecated - milestone data now comes from tasks with `task_type_id = 9`

**Phase Milestone Data Source:**
Phase milestone information is now fetched from the `tasks` table where:
- `task_type_id = 9` (Phase Milestone type)
- `phase_id` matches the current phase
- Includes: task name, description, due date, status, priority, and assigned person

**Query for Phase Milestones:**
```sql
-- Get milestone tasks for a specific phase
SELECT t.*, 
       tt.type_name,
       p.first_name, p.last_name
FROM tasks t
JOIN task_types tt ON t.task_type_id = tt.task_type_id
JOIN people p ON t.owner_id = p.person_id
WHERE t.phase_id = ? 
  AND t.task_type_id = 9  -- Phase Milestone type
ORDER BY t.due_date ASC, t.task_id ASC;
```

### **2. INITIATIVES Table**
```sql
initiative_id SERIAL PRIMARY KEY
phase_id INT REFERENCES phases(phase_id)
initiative_name VARCHAR(200) -- "Week 1: Internal Foundation"
start_date DATE -- 2025-09-15
end_date DATE -- 2025-09-19
key_focus TEXT -- "Build team trust, assess current state"
```

**Current Data:**
- Week 1: Internal Foundation (Sep 15-19)
- Week 2: Domain & Cross-Functional (Sep 22-26)  
- Week 3: Integration & First Value (Sep 29-Oct 3)
- Ongoing: Hidden Intelligence (Sep 15-Oct 3)
- Ongoing: Documentation & Analysis (Sep 15-Oct 3)

### **3. TASKS Table (Hierarchical)**
```sql
task_id SERIAL PRIMARY KEY
phase_id INT REFERENCES phases(phase_id)
initiative_id INT REFERENCES initiatives(initiative_id)
parent_task_id INT REFERENCES tasks(task_id) -- For subtasks
task_name VARCHAR(200)
owner_id INT REFERENCES people(person_id)
task_type VARCHAR(50) -- research, analysis, setup, action_item
source_meeting_id INT REFERENCES meetings(meeting_id) -- NULL = planned, NOT NULL = action item
```

**Task Types:**
- **Planned Tasks**: `source_meeting_id = NULL`
- **Action Items**: `source_meeting_id = [meeting_id]`
- **Parent/Subtask**: Hierarchical via `parent_task_id`

**Phase Milestone Tasks (NEW):**
- **Task Type ID 9**: "Phase Milestone" - Critical decision points and milestones
- **Data Source**: Fetched from `tasks` table instead of `phases.key_milestones` JSONB
- **Benefits**: Better tracking, assignable, status management, due dates
- **Display**: Shown in Key Milestones section of single phase view

**Creating Phase Milestones:**
```sql
-- Create a new phase milestone task
INSERT INTO tasks (
  phase_id, 
  task_name, 
  description, 
  owner_id, 
  task_type_id, 
  due_date,
  status,
  priority
) VALUES (
  1, -- phase_id
  'Critical Decision: Manager Assessment',
  'Evaluate if current manager is salvageable or needs transition plan',
  1, -- owner_id
  9, -- task_type_id = 9 (Phase Milestone)
  '2025-09-19', -- due_date
  'not_started',
  3 -- high priority
);
```

### **4. MEETINGS Table (Dual-JSONB)**
```sql
meeting_id SERIAL PRIMARY KEY
meeting_type_id INT REFERENCES meeting_types(meeting_type_id)
template_data JSONB -- Copy of meeting_type.template_structure
meeting_objectives TEXT -- Meeting-specific learning objectives
key_messages TEXT -- Key messages to communicate
structured_notes JSONB -- Actual agenda responses
unstructured_notes TEXT -- Transcriptions, observations
free_form_insights TEXT -- Random insights
meeting_summary TEXT -- Post-meeting summary
overall_assessment TEXT -- Overall meeting assessment
```

**Meeting Lifecycle:**
1. **Create**: Auto-copy template from meeting_types
2. **Customize**: Modify template_data for specific meeting
3. **Conduct**: Fill structured_notes with agenda responses
4. **Capture**: Add unstructured_notes and insights
5. **Follow-up**: Create action items as tasks

### **5. MEETING_TYPES Table (Template System)**
```sql
meeting_type_id SERIAL PRIMARY KEY
type_name VARCHAR(100) -- "1:1 Direct Report"
template_structure JSONB -- Rich agenda template with meeting_objectives, key_messages, agenda_sections
```

**Current Templates:**
- 1:1 Direct Report (6-part question framework)
- Team Philosophy Session (90-min team building)
- Stakeholder Alignment (60-min cross-functional)
- Customer Interview (45-min customer research)
- Cross-functional Deep Dive (75-min domain expertise)

---

## 🔄 **Critical User Flows**

### **Flow 1: Creating a Meeting**
```mermaid
1. User selects "Create Meeting"
2. Choose meeting_type_id from dropdown
3. System AUTO-COPIES template_structure to template_data
4. User customizes meeting_name, date, duration
5. User adds attendees via meeting_attendees table
6. System stores with status = 'scheduled'
```

**Database Operations:**
```sql
-- Step 1: Create meeting with auto-template copy
INSERT INTO meetings (meeting_type_id, template_data, ...)
SELECT meeting_type_id, template_structure, ...
FROM meeting_types WHERE meeting_type_id = ?;

-- Step 2: Add attendees
INSERT INTO meeting_attendees (meeting_id, person_id, role_in_meeting)
VALUES (?, ?, 'required');
```

### **Flow 2: Conducting a Meeting**
```mermaid
1. User opens scheduled meeting
2. System displays template_data as agenda guide
3. User fills structured_notes following agenda sections
4. User adds unstructured_notes (transcriptions)
5. User captures free_form_insights (observations)
6. System updates meeting status to 'completed'
```

**Database Operations:**
```sql
-- Update meeting with actual results
UPDATE meetings SET 
  structured_notes = '{"agenda_sections": [...]}',
  unstructured_notes = 'Transcription: Sarah mentioned...',
  free_form_insights = 'Body language suggested...',
  status = 'completed'
WHERE meeting_id = ?;
```

### **Flow 3: Creating Action Items from Meetings**
```mermaid
1. User reviews completed meeting
2. Identifies action items from discussion
3. Creates new tasks with source_meeting_id = meeting_id
4. System differentiates from planned tasks
5. Action items appear in task management system
```

**Database Operations:**
```sql
-- Create action item task
INSERT INTO tasks (task_name, owner_id, source_meeting_id, task_type)
VALUES ('Schedule weekly 1:1s with Sarah', 1, 2, 'action_item');
```

### **Flow 4: Task Hierarchy Management**
```mermaid
1. Create parent task (parent_task_id = NULL)
2. Create subtasks referencing parent (parent_task_id = parent_id)
3. UI displays hierarchical tree structure
4. Progress rolls up from subtasks to parent
```

**Database Operations:**
```sql
-- Parent task
INSERT INTO tasks (task_name, parent_task_id) VALUES ('Documentation Archaeology', NULL);

-- Subtasks
INSERT INTO tasks (task_name, parent_task_id) VALUES ('Review Q3 OKRs', 1);
INSERT INTO tasks (task_name, parent_task_id) VALUES ('Review PRDs', 1);
```

---

## 🎯 **UI Component Requirements**

### **1. Meeting Scheduler Component**
**Required Features:**
- Meeting type dropdown (from meeting_types table)
- Auto-populate duration from default_duration_minutes
- People picker with role assignment (organizer/required/optional)
- Calendar integration for scheduling
- Template preview showing agenda structure

**Key Queries:**
```sql
-- Get available meeting types
SELECT type_name, default_duration_minutes, description 
FROM meeting_types ORDER BY type_name;

-- Get template structure for preview
SELECT template_structure FROM meeting_types WHERE meeting_type_id = ?;

-- Get available people for attendees
SELECT person_id, first_name, last_name, role_title 
FROM people ORDER BY first_name;
```

### **2. Meeting Conductor Component**
**Required Features:**
- Display template_data as structured agenda
- Editable sections for structured_notes
- Free-form text areas for unstructured_notes
- Action item capture with quick task creation
- Progress indicator through agenda sections

**Key Queries:**
```sql
-- Get meeting with template
SELECT m.*, mt.type_name, jsonb_pretty(m.template_data) as agenda
FROM meetings m 
JOIN meeting_types mt ON m.meeting_type_id = mt.meeting_type_id
WHERE m.meeting_id = ?;

-- Get attendees
SELECT p.first_name, p.last_name, ma.role_in_meeting, ma.attendance_status
FROM meeting_attendees ma
JOIN people p ON ma.person_id = p.person_id  
WHERE ma.meeting_id = ?;
```

### **3. Task Management Dashboard**
**Required Features:**
- Hierarchical task display (parent/subtask tree)
- Filter by planned vs action items
- Workstream color coding
- Progress tracking with status updates
- People involvement display

**Key Queries:**
```sql
-- Get hierarchical task structure
WITH RECURSIVE task_hierarchy AS (
  -- Parent tasks
  SELECT task_id, task_name, parent_task_id, 0 as level
  FROM tasks WHERE parent_task_id IS NULL
  
  UNION ALL
  
  -- Subtasks  
  SELECT t.task_id, t.task_name, t.parent_task_id, th.level + 1
  FROM tasks t
  JOIN task_hierarchy th ON t.parent_task_id = th.task_id
)
SELECT * FROM task_hierarchy ORDER BY level, task_name;

-- Distinguish planned vs action items
SELECT 
  task_name,
  CASE WHEN source_meeting_id IS NULL THEN 'Planned' ELSE 'Action Item' END as source,
  m.meeting_name as source_meeting
FROM tasks t
LEFT JOIN meetings m ON t.source_meeting_id = m.meeting_id;
```

### **4. Phase Progress Dashboard**
**Required Features:**
- Timeline visualization of phases
- Success checkpoint tracking
- Learning vs Value progression
- Key milestone indicators (from tasks table)
- Constraint/holiday callouts

**Key Queries:**
```sql
-- Get phase overview with progress
SELECT 
  phase_name,
  start_date,
  end_date,
  learning_percentage,
  value_percentage,
  working_days,
  success_checkpoints,
  constraints_notes,
  phase_outcomes
FROM phases ORDER BY phase_number;

-- Get key milestones for a phase (from tasks table)
SELECT 
  t.task_name,
  t.description,
  t.due_date,
  t.status,
  t.priority,
  p.first_name || ' ' || p.last_name as owner_name
FROM tasks t
JOIN people p ON t.owner_id = p.person_id
WHERE t.phase_id = ? 
  AND t.task_type_id = 9  -- Phase Milestone type
ORDER BY t.due_date ASC;

-- Get initiative progress within phase
SELECT 
  i.initiative_name,
  i.start_date,
  i.end_date,
  i.key_focus,
  COUNT(t.task_id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
FROM initiatives i
LEFT JOIN tasks t ON i.initiative_id = t.initiative_id
WHERE i.phase_id = ?
GROUP BY i.initiative_id;
```

---
### addition to the tasks table (added task_type table)
🔄 Updated User Flow:
1. User creates task
2. Selects from task_type dropdown (populated from task_types table)
3. UI shows color-coded task type with icon
4. Filtering by task type becomes reliable
5. Reporting aggregates properly by type
📋 UI Component Enhancement:
sql-- Populate task type dropdown
SELECT task_type_id, type_name, description, color_code, icon 
FROM task_types 
WHERE is_active = true 
ORDER BY type_name;

-- Display tasks with type info
SELECT 
    t.task_name,
    tt.type_name,
    tt.color_code,
    tt.icon
FROM tasks t
JOIN task_types tt ON t.task_type_id = tt.task_type_id;


---

## 🚨 **Critical Missing Components**

### **1. METRICS_BASELINE Table (URGENT)**
```sql
CREATE TABLE metrics_baseline (
  metric_id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100), -- "Onboarding Conversion"
  current_state VARCHAR(50), -- "X%"
  industry_benchmark VARCHAR(50), -- "Y%"  
  opportunity_impact VARCHAR(100), -- "Z% improvement = $M"
  measurement_date DATE,
  phase_id INT REFERENCES phases(phase_id)
);
```

**Required Data:**
- Onboarding Conversion: X% → Y% → Z% improvement = $M
- Time to First Payment: X days → Y days → Z days = $M
- Drop-off at KYC: X% → Y% → Z% = customers
- Compliance Rejection Rate: X% → Y% → Impact
- Support Tickets: X/month → Y/month → Cost savings

### **2. DECISION_POINTS Table (HIGH)**
```sql
CREATE TABLE decision_points (
  decision_id SERIAL PRIMARY KEY,
  phase_id INT REFERENCES phases(phase_id),
  decision_name VARCHAR(200), -- "Manager Decision Point"
  scheduled_date DATE, -- Day 5: 2025-09-19
  description TEXT, -- "Privately decide: salvageable or transition plan?"
  criticality_level VARCHAR(20), -- "high", "medium", "low"
  decision_criteria JSONB, -- Complex decision factors
  decision_made BOOLEAN DEFAULT false,
  decision_outcome TEXT
);
```

**Required Data:**
- Day 5: Manager Decision Point (salvageable or transition?)
- Day 13: CPO Skip-Level (approach alignment)
- Day 15: Phase 1 Closeout (Phase 2 approval)

---

## 📱 **Implementation Priority Order**

### **Phase 1: Core Functionality (Week 1)**
1. **Meeting System**
   - Meeting type selection
   - Template auto-copy mechanism
   - Basic attendee management
   - Meeting conductor interface

2. **Task Management**
   - Hierarchical task display
   - Basic CRUD operations
   - Status tracking
   - Planned vs action item distinction

### **Phase 2: Advanced Features (Week 2)**
3. **Metrics Dashboard**
   - Implement metrics_baseline table
   - Success tracking visualization
   - Progress indicators

4. **Decision Points**
   - Implement decision_points table
   - Go/no-go workflow
   - Critical milestone tracking

### **Phase 3: Polish & Integration (Week 3)**
5. **Cross-functional Views**
   - Workstream filtering
   - People-centric views
   - Timeline visualizations

6. **Reporting & Analytics**
   - Phase progress reports
   - Meeting effectiveness metrics
   - Action item completion rates

---

## 🔑 **Critical Success Factors**

### **1. Template System Integrity**
- Ensure template_data auto-copy works correctly
- Maintain JSONB structure consistency
- Handle template customization properly
- **Field Name Consistency**: All references use `meeting_objectives` (not `learning_objectives`)

### **2. Hierarchical Data Management**
- Task parent/child relationships must be bulletproof
- UI must clearly show hierarchy
- Progress rollup from subtasks to parents

### **3. Action Item Workflow**
- Seamless meeting → action item → task creation
- Clear distinction between planned vs reactive work
- Proper source meeting tracking

### **4. Multi-select Relationships**
- Workstream assignments (M:M via junction tables)
- People involvement in tasks
- Meeting attendee management

### **5. JSONB Query Performance**
- Index JSONB fields for common queries
- Optimize template_data searches
- Handle complex JSONB updates efficiently

---

## 🛠️ **Technical Implementation Notes**

### **Database Connections**
- All tables use standard PostgreSQL with JSONB support
- Foreign key constraints enforce referential integrity
- Triggers auto-update timestamps (updated_at)

### **JSONB Handling**
- Meeting templates stored as structured JSONB
- Phase checkpoints/milestones in JSONB
- Use `jsonb_pretty()` for readable displays
- Leverage PostgreSQL JSONB operators for queries

### **Security Considerations**
- Implement row-level security (RLS) for multi-tenant
- Audit trails for sensitive decisions
- Access controls for confidential documents

### **Performance Optimization**
- Index commonly queried fields (phase_id, owner_id, scheduled_date)
- Consider materialized views for complex reporting
- Optimize JSONB queries with GIN indexes

This implementation guide provides the complete foundation for building the VP Product Onboarding system with full database context and specific technical requirements.