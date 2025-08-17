# VP Product Onboarding System - AI Agent Database Operations Guide

## 🎯 Purpose
This guide helps AI agents safely interact with the VP Product Onboarding database using Supabase MCP. It explains data structures, relationships, and safe update patterns to prevent data corruption or relationship violations.

---

## 📊 **Core Data Architecture Overview**

### **Hierarchical Flow**
```
PHASES → INITIATIVES → TASKS/MEETINGS → ACTION_ITEMS
```

### **People Integration**
```
PEOPLE ← DEPARTMENTS
  ↓ (relationships)
TASKS (owner + involved people)
MEETINGS (attendees with roles)
```

### **Template System**
```
MEETING_TYPES (templates) → MEETINGS (instances)
TASK_TYPES (normalized) → TASKS (instances)
```

---

## 🗂️ **Detailed Table Documentation**

### **1. PHASES Table**

**Purpose:** Strategic onboarding phases (5 total phases)

**Structure:**
```sql
phase_id SERIAL PRIMARY KEY
phase_name VARCHAR(100) -- "Foundation", "Diagnosis & Quick Wins", etc.
phase_number INT -- 1, 2, 3, 4, 5
start_date DATE -- 2025-09-15
end_date DATE -- 2025-10-05 (NULL for ongoing phases)
start_week INT GENERATED -- Auto-calculated from start_date
end_week INT GENERATED -- Auto-calculated from end_date
learning_percentage INT -- 80, 60, 40, 30, 20 (decreasing)
value_percentage INT -- 20, 40, 60, 70, 80 (increasing)
working_days INT -- Business days in phase
success_checkpoints JSONB -- Complex success criteria
key_milestones JSONB -- Critical decision points
constraints_notes TEXT -- Holiday/external factor notes
phase_outcomes JSONB -- Expected results
```

**Critical Fields:**
- `start_week` and `end_week` are **GENERATED COLUMNS** - never update directly
- `learning_percentage + value_percentage` should always equal 100
- `phase_number` must be unique and sequential

**JSONB Structure - success_checkpoints:**
```json
{
  "knowledge_goals": ["Draw the entire onboarding funnel with metrics", "..."],
  "relationship_goals": ["Have allies in Legal, Engineering, Sales", "..."],
  "deliverable_goals": ["Complete onboarding problem statement", "..."],
  "decision_goals": ["Make go/no-go decision on underperforming manager", "..."]
}
```

**Safe Update Patterns:**
```sql
-- ✅ Safe: Update description or constraints
UPDATE phases SET description = 'Updated description' WHERE phase_id = 1;

-- ✅ Safe: Update JSONB success criteria
UPDATE phases SET success_checkpoints = jsonb_set(success_checkpoints, '{knowledge_goals}', '["New goal"]') WHERE phase_id = 1;

-- ❌ Dangerous: Never update generated columns
-- UPDATE phases SET start_week = 2 WHERE phase_id = 1; -- Will fail

-- ❌ Dangerous: Don't break percentage logic
-- UPDATE phases SET learning_percentage = 90, value_percentage = 30 WHERE phase_id = 1; -- Totals 120%
```

---

### **2. PEOPLE Table**

**Purpose:** Team members and stakeholders

**Structure:**
```sql
person_id SERIAL PRIMARY KEY
first_name VARCHAR(100) NOT NULL -- Only required field
last_name VARCHAR(100) -- Optional
email VARCHAR(255) -- Optional
role_title VARCHAR(100) -- "VP Product", "Director of Product"
department_id INT REFERENCES departments(department_id)
reporting_manager_id INT REFERENCES people(person_id) -- Self-reference
person_type VARCHAR(50) -- "team_member", "stakeholder", "external"
influence_level INT CHECK (1-5) -- How much influence they have
engagement_priority INT CHECK (1-5) -- How important to your success
```

**Critical Relationships:**
- `reporting_manager_id` creates org chart hierarchy
- `department_id` links to departments table
- Used as owner in tasks, attendee in meetings

**Safe Update Patterns:**
```sql
-- ✅ Safe: Update person details
UPDATE people SET 
  last_name = 'Smith',
  email = 'sarah.smith@company.com',
  role_title = 'Senior Director of Product'
WHERE person_id = 2;

-- ✅ Safe: Update reporting structure
UPDATE people SET reporting_manager_id = 1 WHERE person_id = 5;

-- ✅ Safe: Update influence/priority (within constraints)
UPDATE people SET influence_level = 4, engagement_priority = 5 WHERE person_id = 2;

-- ❌ Dangerous: Can't set person as their own manager
-- UPDATE people SET reporting_manager_id = 2 WHERE person_id = 2; -- Circular reference

-- ❌ Dangerous: Invalid constraint values
-- UPDATE people SET influence_level = 6 WHERE person_id = 2; -- Must be 1-5
```

---

### **3. MEETINGS Table**

**Purpose:** Scheduled meetings with template-based agendas and notes

**Structure:**
```sql
meeting_id SERIAL PRIMARY KEY
phase_id INT REFERENCES phases(phase_id) NOT NULL
initiative_id INT REFERENCES initiatives(initiative_id) -- Optional
meeting_type_id INT REFERENCES meeting_types(meeting_type_id) NOT NULL
meeting_name VARCHAR(200) NOT NULL
scheduled_date TIMESTAMP WITH TIME ZONE
duration_minutes INT
location_platform VARCHAR(100) -- "Conference Room A", "Zoom"
status VARCHAR(50) DEFAULT 'scheduled' -- 'scheduled', 'completed', 'cancelled'

-- Template & Planning
template_data JSONB -- Copy of meeting_type.template_structure
meeting_objectives TEXT -- Was learning_objectives (RENAMED!)
key_messages TEXT -- What to communicate

-- Actual Meeting Results
structured_notes JSONB -- NEW FORMAT! Question/answer pairs
unstructured_notes TEXT -- Transcriptions, observations
free_form_insights TEXT -- Random insights
meeting_summary TEXT -- High-level summary
overall_assessment TEXT -- Meeting effectiveness
```

**CRITICAL CHANGE:** `learning_objectives` has been renamed to `meeting_objectives`

**JSONB Structure - template_data (copied from meeting_types):**
```json
{
  "agenda_sections": [
    {
      "section": "Context & Background",
      "purpose": "Understand their journey and motivations",
      "questions": ["Walk me through your background...", "What drew you to fintech?"],
      "time_minutes": 8
    }
  ],
  "key_messages": ["I am here to listen and learn first", "..."],
  "expected_outputs": ["Notes on key challenges", "Assessment of engagement"]
}
```

**JSONB Structure - structured_notes (NEW FORMAT!):**
```json
{
  "agenda_sections": [
    {
      "questions": [
        {
          "question_text": "Walk me through your background and how you got to this role",
          "question_hash": "q0_1755379849022",
          "response": "previously had multiple roles in other companies.",
          "response_timestamp": "2025-08-16T21:30:49.022Z"
        }
      ]
    }
  ]
}
```

**Safe Update Patterns:**
```sql
-- ✅ Safe: Update meeting details
UPDATE meetings SET 
  meeting_name = 'Updated Meeting Name',
  scheduled_date = '2025-09-20 10:00:00-04',
  duration_minutes = 90
WHERE meeting_id = 2;

-- ✅ Safe: Update status
UPDATE meetings SET status = 'completed' WHERE meeting_id = 2;

-- ✅ Safe: Add structured notes (NEW FORMAT)
UPDATE meetings SET structured_notes = '{
  "agenda_sections": [{
    "questions": [{
      "question_text": "What is working well in your area?",
      "question_hash": "q1_' || extract(epoch from now()) * 1000 || '",
      "response": "Team collaboration has improved significantly",
      "response_timestamp": "' || now() || '"
    }]
  }]
}' WHERE meeting_id = 2;

-- ✅ Safe: Update meeting objectives (RENAMED FIELD!)
UPDATE meetings SET meeting_objectives = 'Build trust and assess team dynamics' WHERE meeting_id = 2;

-- ❌ Dangerous: Don't use old field name
-- UPDATE meetings SET learning_objectives = '...' WHERE meeting_id = 2; -- FIELD DOESN'T EXIST

-- ❌ Dangerous: Don't break foreign key constraints
-- UPDATE meetings SET meeting_type_id = 999 WHERE meeting_id = 2; -- Invalid meeting type
```

**Meeting Creation Flow:**
```sql
-- 1. Create meeting with auto-copied template
INSERT INTO meetings (phase_id, meeting_type_id, meeting_name, template_data, meeting_objectives)
SELECT 1, 1, '1:1 with New Team Member', 
       template_structure, 
       'Understand new team member perspective'
FROM meeting_types WHERE meeting_type_id = 1;

-- 2. Add attendees
INSERT INTO meeting_attendees (meeting_id, person_id, role_in_meeting)
VALUES (currval('meetings_meeting_id_seq'), 2, 'required');
```

---

### **4. TASKS Table**

**Purpose:** Work items with hierarchical structure and action item tracking

**Structure:**
```sql
task_id SERIAL PRIMARY KEY
phase_id INT REFERENCES phases(phase_id) NOT NULL
initiative_id INT REFERENCES initiatives(initiative_id) -- Optional
parent_task_id INT REFERENCES tasks(task_id) -- For subtasks
task_name VARCHAR(200) NOT NULL
description TEXT
owner_id INT REFERENCES people(person_id) NOT NULL
start_date DATE
due_date DATE
status VARCHAR(50) DEFAULT 'not_started' -- 'not_started', 'in_progress', 'completed', 'blocked'
priority INT
task_type_id INT REFERENCES task_types(task_type_id) -- NORMALIZED!
notes TEXT
source_meeting_id INT REFERENCES meetings(meeting_id) -- NULL = planned, NOT NULL = action item
```

**Task Classification Logic:**
- **Planned Task**: `source_meeting_id = NULL` (planned upfront)
- **Action Item**: `source_meeting_id = [meeting_id]` (came from meeting)
- **Parent Task**: `parent_task_id = NULL`
- **Subtask**: `parent_task_id = [parent_task_id]`

**Available Task Types (task_types table):**
| ID | Type | Description | Color |
|----|------|-------------|-------|
| 1 | research | Information gathering and analysis | #3B82F6 |
| 2 | analysis | Data analysis and evaluation | #10B981 |
| 3 | setup | System access and configuration | #F59E0B |
| 4 | documentation | Document creation and maintenance | #6366F1 |
| 5 | intelligence | Organizational dynamics mapping | #8B5CF6 |
| 6 | planning | Strategic planning and roadmap | #EC4899 |
| 7 | action_item | Follow-up tasks from meetings | #EF4444 |
| 8 | deliverable | Concrete output creation | #059669 |

**Safe Update Patterns:**
```sql
-- ✅ Safe: Create planned parent task
INSERT INTO tasks (phase_id, initiative_id, task_name, description, owner_id, task_type_id)
VALUES (1, 1, 'Research Competitors', 'Analyze top 3 competitor onboarding flows', 1, 1);

-- ✅ Safe: Create subtask
INSERT INTO tasks (phase_id, initiative_id, parent_task_id, task_name, owner_id, task_type_id)
VALUES (1, 1, 1, 'Review Stripe onboarding', 1, 1);

-- ✅ Safe: Create action item from meeting
INSERT INTO tasks (phase_id, task_name, owner_id, task_type_id, source_meeting_id)
VALUES (1, 'Schedule follow-up with Legal team', 1, 7, 3);

-- ✅ Safe: Update task status
UPDATE tasks SET status = 'in_progress', notes = 'Started research phase' WHERE task_id = 5;

-- ✅ Safe: Assign to different workstreams (many-to-many)
INSERT INTO task_workstreams (task_id, workstream_id) VALUES (5, 1), (5, 4);

-- ❌ Dangerous: Don't create circular parent references
-- UPDATE tasks SET parent_task_id = 10 WHERE task_id = 5; -- If task 5 is parent of task 10

-- ❌ Dangerous: Don't use invalid task type
-- UPDATE tasks SET task_type_id = 999 WHERE task_id = 5; -- Invalid task type
```

**Task Relationship Queries:**
```sql
-- Get task hierarchy
WITH RECURSIVE task_tree AS (
  SELECT task_id, task_name, parent_task_id, 0 as level
  FROM tasks WHERE parent_task_id IS NULL
  UNION ALL
  SELECT t.task_id, t.task_name, t.parent_task_id, tt.level + 1
  FROM tasks t JOIN task_tree tt ON t.parent_task_id = tt.task_id
)
SELECT * FROM task_tree ORDER BY level, task_name;

-- Distinguish planned vs action items
SELECT task_name,
  CASE WHEN source_meeting_id IS NULL THEN 'Planned Task' ELSE 'Action Item' END as source
FROM tasks;
```

---

### **5. WORKSTREAMS & TASK_TYPES Tables**

**Purpose:** Normalized reference tables for categorization

**WORKSTREAMS (4 strategic focus areas):**
| ID | Name | Description | Color |
|----|------|-------------|-------|
| 1 | Product | Onboarding funnel, KYC/KYB, risk scoring | #3B82F6 |
| 2 | Process | Decision forums, change control, incident comms | #10B981 |
| 3 | People | Org health, performance expectations | #F59E0B |
| 4 | Partnerships | Legal, Compliance, Finance, Sales, CS, Engineering | #EF4444 |

**Many-to-Many Relationships:**
- Tasks can belong to multiple workstreams via `task_workstreams` junction table
- Initiatives can belong to multiple workstreams via `initiative_workstreams` junction table

**Safe Update Patterns:**
```sql
-- ✅ Safe: Assign task to multiple workstreams
DELETE FROM task_workstreams WHERE task_id = 5; -- Clear existing
INSERT INTO task_workstreams (task_id, workstream_id) VALUES (5, 1), (5, 4); -- Product + Partnerships

-- ✅ Safe: Add new task type (if needed)
INSERT INTO task_types (type_name, description, color_code, icon)
VALUES ('meeting_prep', 'Meeting preparation tasks', '#7C3AED', 'calendar-check');

-- ❌ Dangerous: Don't delete referenced workstreams
-- DELETE FROM workstreams WHERE workstream_id = 1; -- Will fail if tasks reference it

-- ❌ Dangerous: Don't break color code format
-- UPDATE workstreams SET color_code = 'blue' WHERE workstream_id = 1; -- Must be hex format #XXXXXX
```

---

### **6. MEETING_ATTENDEES & TASK_PEOPLE Tables**

**Purpose:** Many-to-many relationship tables for people involvement

**MEETING_ATTENDEES:**
```sql
meeting_id INT REFERENCES meetings(meeting_id)
person_id INT REFERENCES people(person_id)
role_in_meeting VARCHAR(50) -- 'organizer', 'required', 'optional', 'note_taker'
attendance_status VARCHAR(50) -- 'invited', 'accepted', 'declined', 'attended', 'no_show'
```

**TASK_PEOPLE:**
```sql
task_id INT REFERENCES tasks(task_id)
person_id INT REFERENCES people(person_id)
role_type VARCHAR(50) -- 'owner', 'involved', 'reviewer', 'approver'
```

**Safe Update Patterns:**
```sql
-- ✅ Safe: Add meeting attendees
INSERT INTO meeting_attendees (meeting_id, person_id, role_in_meeting, attendance_status)
VALUES (2, 3, 'required', 'invited'), (2, 4, 'optional', 'invited');

-- ✅ Safe: Update attendance status
UPDATE meeting_attendees SET attendance_status = 'attended' 
WHERE meeting_id = 2 AND person_id = 3;

-- ✅ Safe: Add people to task
INSERT INTO task_people (task_id, person_id, role_type)
VALUES (5, 2, 'involved'), (5, 3, 'reviewer');

-- ❌ Dangerous: Don't create duplicate relationships
-- Check for existing relationship before inserting
```

---

## 🔄 **Critical Data Flows**

### **Meeting → Action Item Flow**
```sql
-- 1. Conduct meeting and capture notes
UPDATE meetings SET 
  structured_notes = '{"agenda_sections": [{"questions": [...]}]}',
  status = 'completed'
WHERE meeting_id = 2;

-- 2. Create action item task
INSERT INTO tasks (phase_id, task_name, owner_id, task_type_id, source_meeting_id)
VALUES (1, 'Schedule weekly 1:1s with Sarah', 1, 7, 2);
```

### **Task Hierarchy Creation**
```sql
-- 1. Create parent task
INSERT INTO tasks (phase_id, task_name, owner_id, task_type_id)
VALUES (1, 'Documentation Archaeology', 1, 1) RETURNING task_id;

-- 2. Create subtasks referencing parent
INSERT INTO tasks (phase_id, parent_task_id, task_name, owner_id, task_type_id)
VALUES (1, [parent_task_id], 'Review Q3 OKRs', 1, 1);
```

### **Meeting Creation with Template**
```sql
-- 1. Create meeting with auto-copied template
INSERT INTO meetings (phase_id, meeting_type_id, meeting_name, template_data, meeting_objectives)
SELECT 1, 1, 'New 1:1 Meeting', template_structure, 'Build trust and assess needs'
FROM meeting_types WHERE meeting_type_id = 1;

-- 2. Add attendees
INSERT INTO meeting_attendees (meeting_id, person_id, role_in_meeting)
VALUES (currval('meetings_meeting_id_seq'), 2, 'required');
```

---

## ⚠️ **Common Pitfalls to Avoid**

### **JSONB Field Updates**
```sql
-- ❌ Wrong: Overwrites entire JSONB
UPDATE meetings SET template_data = '{"new": "data"}' WHERE meeting_id = 2;

-- ✅ Correct: Use jsonb_set for partial updates
UPDATE meetings SET template_data = jsonb_set(template_data, '{key_messages}', '["New message"]') 
WHERE meeting_id = 2;
```

### **Foreign Key Violations**
```sql
-- ❌ Wrong: Invalid references
UPDATE tasks SET owner_id = 999 WHERE task_id = 5; -- Person doesn't exist

-- ✅ Correct: Verify existence first
UPDATE tasks SET owner_id = 3 WHERE task_id = 5 AND EXISTS(SELECT 1 FROM people WHERE person_id = 3);
```

### **Circular References**
```sql
-- ❌ Wrong: Creating circular parent-child relationships
UPDATE tasks SET parent_task_id = 10 WHERE task_id = 5; -- If task 5 is parent of task 10

-- ✅ Correct: Check hierarchy before updates
```

### **Generated Column Updates**
```sql
-- ❌ Wrong: Trying to update generated columns
UPDATE phases SET start_week = 2 WHERE phase_id = 1; -- Will fail

-- ✅ Correct: Update source columns, generated columns auto-update
UPDATE phases SET start_date = '2025-09-22' WHERE phase_id = 1; -- start_week recalculates
```

---

## 📝 **Best Practices for AI Agents**

### **1. Always Verify Relationships**
```sql
-- Before updating, check if referenced records exist
SELECT EXISTS(SELECT 1 FROM people WHERE person_id = ?) AS person_exists;
SELECT EXISTS(SELECT 1 FROM meeting_types WHERE meeting_type_id = ?) AS type_exists;
```

### **2. Use Transactions for Complex Operations**
```sql
BEGIN;
  INSERT INTO meetings (...) RETURNING meeting_id;
  INSERT INTO meeting_attendees (meeting_id, ...) VALUES (currval('meetings_meeting_id_seq'), ...);
COMMIT;
```

### **3. Preserve JSONB Structure**
```sql
-- When updating structured_notes, maintain the expected format
{
  "agenda_sections": [
    {
      "questions": [
        {
          "question_text": "...",
          "question_hash": "q0_[timestamp]",
          "response": "...",
          "response_timestamp": "ISO 8601 format"
        }
      ]
    }
  ]
}
```

### **4. Status Management**
```sql
-- Use consistent status values
-- Tasks: 'not_started', 'in_progress', 'completed', 'blocked'
-- Meetings: 'scheduled', 'completed', 'cancelled'
-- Meeting Attendees: 'invited', 'accepted', 'declined', 'attended', 'no_show'
```

### **5. Safe Deletion Patterns**
```sql
-- Check for dependencies before deleting
SELECT COUNT(*) FROM tasks WHERE owner_id = ? AND status != 'completed';
SELECT COUNT(*) FROM meeting_attendees WHERE person_id = ?;

-- Soft delete by updating status instead of hard delete
UPDATE people SET person_type = 'inactive' WHERE person_id = ?;
```

---

This guide ensures safe, consistent database operations while maintaining all relationships and data integrity within the VP Product Onboarding system.