# VP Product Onboarding Master Plan - Updated Project Instructions
*Version 2.0 - Based on Implementation Reality*

## 🎯 Context for AI Assistant
You are helping execute and evolve a detailed onboarding plan for a VP of Product role at a public fintech company. The plan has been implemented in a Supabase database with comprehensive tracking of phases, initiatives, meetings, and tasks. The context has evolved from initial planning to focus on **management transition leadership** following the Company's understanding that the group should be led by a VP, which led to the  departure of the previous director (Ram)  that the VP will be replacing.

## 🏢 Role Context

**Position:** VP of Product, Platform Organization
**Company:** Public fintech, 2M users, SMB focus, payments/cross-border transfers
**Focus Area:** Customer lifecycle management, specifically onboarding
**Team:** 9 people (structure needs to be assessed as part of the plan)
- Direct reports: Ravid (Team Lead CLM Team 1 ), Ira (Team Lead CLM Team 2)
**Reporting:** Reports to SVP → CPO
**Key Partners:** Engineering, Legal, Finance, Compliance, Sales, CS
**Start Date:** September 15th 2025

### 🔄 Critical Context Evolution
- **Previous situation:** Director was let go, team morale was low
- **Current focus:** Management transition leadership with immediate stabilization needs
- **Key opportunity:** Team is ready for change - and need to be addressed with humbleness, openness and quick delivery of value so to earn the team's trust and respect.
- **Leadership mandate:** Show decisive action, not just assessment

## 💫 Strategic Outcomes: 
1. **Risk-Adjusted Conversion Up** – Balance speed-to-revenue with compliance guardrails
2. **Executive Confidence & Team Trust** – Professional transition handling with visible results
3. **Team Liberation & Velocity** – Unblock initiatives, restore morale, improve delivery
4. **Cross-functional Partnership** – Rebuild relationships damaged during previous regime

## 🧩 Workstreams 
1. **Product** (ID: 1) – Onboarding funnel, KYC/KYB, risk and fraud, activation
2. **Process** (ID: 2) – Internal and external ceremonies, Decision forums, change control, incident comms
3. **People** (ID: 3) – Org health, Org structure, performance, succession planning
4. **Partnerships** (ID: 4) – Legal, Compliance, Finance, Sales, CS, Engineering, Growth

## 📊 Database Implementation Status

### ✅ **Fully Implemented Tables (12)**
- **phases** - 5 strategic phases with rich JSONB tracking
- **initiatives** - 11 work groupings across phases
- **tasks** - 131 tasks with hierarchical structure
- **meetings** - 67 scheduled meetings with templates
- **people** - Team members and stakeholders
- **departments** - Organizational structure
- **meeting_types** - 16 meeting templates with structured agendas
- **task_types** - 10 task categories including "Phase Milestone"
- **workstreams** - 4 strategic focus areas
- **Junction tables** for many-to-many relationships

### 📈 **Current Implementation Metrics**
- **Phase 1:** 27 meetings, 76 tasks planned
- **Phase 2:** 40 meetings, 55 tasks planned
- **Meeting types:** 16 templates created with JSONB structures
- **Task types:** 10 categories including new "Phase Milestone" type
- **Action items:** 11 identified from meetings
- **Subtasks:** 58 hierarchical task relationships

## 🗓️ Core Framework: Evolved Phase Structure

### **Phase 1: Foundation (Weeks 1-3)**
**Theme:** "Leading Through Transition" [80% Learning / 20% Value]
**Duration:** Sep 15 - Oct 5 (15 working days)
**Focus Evolution:** From "earning the right" to **immediate stabilization leadership**

**Key Initiatives:**
- Week 1: Internal Foundation - Team stabilization post-transition
- Team Operating Model Deep Dive
- Ongoing: Hidden Intelligence Gathering & Documentation

**Success Metrics (Updated):**
- Team anxiety levels measured and addressed
- Liberation list documented (blocked initiatives now possible)
- Trust established through transparent communication
- Fresh Start Team Charter created

**Key Deliverables:**
- Team Charter v0.1 - Fresh Start Edition
- Liberation List - Previously Blocked Opportunities
- Quick wins execution plan (2-3 implemented)
- Team Stability Assessment
- Onboarding Problem Statement (opportunity-focused)

### **Phase 2: Diagnosis & Quick Wins (Weeks 4-6)**
**Theme:** "Building Momentum" [60% Learning / 40% Value]
**Duration:** Oct 6 - Oct 26 (15 working days)
**Focus:** Deep diagnosis while shipping visible improvements

**Key Initiatives:**
- Week 4: Deep Diagnosis & Analysis
- Week 5: Quick Wins Execution (3 wins targeted)
- Week 6: Strategic Synthesis & Communication
- Ongoing: Team Operating Model Deep Dive

**Success Metrics:**
- 10-15% improvement in at least one funnel metric
- 2-3 quick wins shipped and measured
- Comprehensive diagnosis completed
- First month readout delivered
- Q1 2025 roadmap drafted

### **Phases 3-5** (To Be Refined Based on Phase 1-2 Learnings)
- Phase 3: Q4 Integration (Weeks 7-9) - Learning the rhythm [40/60]
- Phase 4: Strategic Positioning (Weeks 10-12) - Shaping the future [30/70]
- Phase 5: Execution Leadership (Week 13+) - Driving transformation [20/80]

## 🏗️ Key Architectural Decisions

### **1. Meeting Template System**
- 16 meeting types with pre-structured JSONB templates
- Auto-copy mechanism from meeting_types to meetings.template_data
- Dual JSONB structure: template_data (plan) + structured_notes (actual)
- Meeting objectives field (renamed from learning_objectives)

### **2. Task Hierarchy & Classification**
- Parent-child task relationships via parent_task_id
- 10 task types including "Phase Milestone" for critical decisions
- Source tracking: planned tasks (source_meeting_id = NULL) vs action items
- Multi-workstream assignment capability

### **3. Phase Milestone Evolution**
- **DEPRECATED:** phases.key_milestones JSONB field
- **NEW:** Milestones stored as tasks with task_type_id = 9
- Benefits: Assignable, trackable, status management

### **4. Initiative Structure**
- Mix of weekly and ongoing initiatives
- Overlapping timelines to reflect parallel workstreams
- Rich key_focus descriptions reflecting transition context

## 🎮 Implementation Guidelines

### **For Meeting Management**
```sql
-- Create meeting with template auto-copy
INSERT INTO meetings (phase_id, meeting_type_id, meeting_name, template_data, meeting_objectives)
SELECT phase_id, meeting_type_id, meeting_name, template_structure, 'objectives'
FROM meeting_types WHERE meeting_type_id = ?;
```

### **For Task Creation**
```sql
-- Create phase milestone
INSERT INTO tasks (phase_id, task_name, task_type_id, due_date, owner_id)
VALUES (?, 'Critical Decision Point', 9, '2025-10-01', ?);

-- Create action item from meeting
INSERT INTO tasks (phase_id, task_name, source_meeting_id, task_type_id)
VALUES (?, 'Follow-up action', meeting_id, 7);
```

### **For Progress Tracking**
- Use status fields consistently: scheduled → completed
- Track meeting attendance: invited → attended
- Monitor task progress: not_started → in_progress → completed

## 🚨 Critical Adaptations from Original Plan

### **1. Management Transition Focus**
- Original: Build credibility gradually
- **Current:** Immediate leadership presence required
- Impact: Front-loaded stabilization activities in We