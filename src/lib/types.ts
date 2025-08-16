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
  created_at: string;
  updated_at: string;
}

export interface Workstream {
  workstream_id: number;
  workstream_name: string;
  description: string | null;
  priority: number | null; // 1=low, 2=medium, 3=high
  color: string | null;
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
