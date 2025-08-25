// Database entity types
export interface Phase {
  phase_id: number;
  phase_name: string;
  phase_number: number;
  start_date: string;
  end_date: string;
  start_week: number;
  end_week: number;
  learning_percentage: number;
  value_percentage: number;
  description: string | null;
  success_criteria: string | null;
  success_checkpoints: any | null; // JSONB - array of checkpoint objects
  key_milestones: any | null; // JSONB - array of milestone objects
  constraints_notes: string | null;
  phase_outcomes: any | null; // JSONB - array of outcome objects
  working_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface Workstream {
  workstream_id: number;
  workstream_name: string;
  description: string | null;
  priority: number | null; // 1=low, 2=medium, 3=high
  color_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  department_id: number;
  department_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Person {
  person_id: number;
  first_name: string;
  last_name: string | null;
  email: string | null;
  role_title: string | null;
  department_id: number | null;
  reporting_manager_id?: number;
  person_type: string | null;
  influence_level: number | null; // 1-5 scale
  engagement_priority: number | null; // 1-5 scale
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  department?: Department;
  reports_to?: Person;
  direct_reports?: Person[];
}

export interface MeetingType {
  meeting_type_id: number;
  type_name: string;
  default_duration_minutes: number | null; // in minutes
  description: string | null;
  template_structure: any | null; // JSONB structure
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TaskType {
  task_type_id: number;
  type_name: string;
  description: string | null;
  color_code: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  task_id: number;
  phase_id: number;
  initiative_id: number | null;
  parent_task_id: number | null;
  task_name: string;
  description: string | null;
  owner_id: number;
  start_date: string | null;
  due_date: string | null;
  status: string;
  priority: number | null;
  notes: string | null;
  source_meeting_id: number | null;
  task_type_id: number | null;
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  task_type?: TaskType;
  owner?: Person;
  phase?: Phase;
  initiative?: {
    initiative_id: number;
    initiative_name: string;
  };
  parent_task?: {
    task_id: number;
    task_name: string;
  };
  subtasks?: Task[];
  workstreams?: Workstream[];
}

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  current: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Table column types
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

// Priority badge colors (for numeric priority values)
export const priorityColors = {
  1: 'bg-green-100 text-green-800',    // Low priority
  2: 'bg-yellow-100 text-yellow-800',  // Medium priority  
  3: 'bg-red-100 text-red-800',        // High priority
} as const;

// Workstream colors mapping
export const workstreamColors = {
  'Product': 'bg-workstream-product text-white',
  'Process': 'bg-workstream-process text-white',
  'People': 'bg-workstream-people text-white',
  'Partnerships': 'bg-workstream-partnerships text-white',
} as const;

// Notes system types
export interface Note {
  id: string;
  header: string;
  body: string;
  tags: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Computed/joined fields
  connected_phases?: ConnectedPhase[];
  connected_meetings?: ConnectedMeeting[];
  connected_initiatives?: ConnectedInitiative[];
  connected_workstreams?: ConnectedWorkstream[];
}

export interface ConnectedPhase {
  phase_id: number;
  phase_name: string;
}

export interface ConnectedMeeting {
  meeting_id: number;
  meeting_name: string;
}

export interface ConnectedInitiative {
  initiative_id: number;
  initiative_name: string;
}

export interface ConnectedWorkstream {
  workstream_id: number;
  workstream_name: string;
}

export interface NoteWithRelationships {
  id: string;
  header: string;
  body: string;
  tags: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  connected_phases: ConnectedPhase[];
  connected_meetings: ConnectedMeeting[];
  connected_initiatives: ConnectedInitiative[];
  connected_workstreams: ConnectedWorkstream[];
}

export interface NoteFilters {
  search?: string;
  tags?: string[];
  importance?: 'low' | 'medium' | 'high' | 'critical';
  connected_entity_type?: 'phase' | 'meeting' | 'initiative' | 'workstream';
  connected_entity_id?: number;
  created_by?: string;
  date_from?: string;
  date_to?: string;
}

export interface CreateNoteData {
  header: string;
  body: string;
  tags?: string[];
  importance?: 'low' | 'medium' | 'high' | 'critical';
  connected_phases?: number[];
  connected_meetings?: number[];
  connected_initiatives?: number[];
  connected_workstreams?: number[];
}

export interface UpdateNoteData {
  header?: string;
  body?: string;
  tags?: string[];
  importance?: 'low' | 'medium' | 'high' | 'critical';
  connected_phases?: number[];
  connected_meetings?: number[];
  connected_initiatives?: number[];
  connected_workstreams?: number[];
}
