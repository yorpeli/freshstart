import type { Task, TaskType } from '../../../lib/types';

export interface TaskWithRelations extends Task {
  task_type: TaskType;
  owner_name: string;
  phase_name: string;
  initiative_name: string;
}

export interface TasksFiltersState {
  searchQuery: string;
  statusFilter: string;
  taskTypeFilter: string;
  workstreamFilter: string;
  groupBy: 'phase' | 'type' | 'status' | 'date' | 'workstream' | 'none';
  sortBy: 'due_date' | 'priority' | 'status' | 'task_name' | 'created_at';
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
}

export interface TasksTableProps {
  tasks: TaskWithRelations[];
  groupBy: 'phase' | 'type' | 'status' | 'date' | 'workstream' | 'none';
  expandedGroups: Set<string>;
  onToggleGroup: (groupKey: string) => void;
  onTaskClick: (task: TaskWithRelations) => void;
  onDeleteClick?: (task: TaskWithRelations) => void;
}

export interface TasksFiltersProps {
  filters: TasksFiltersState;
  taskTypes: TaskType[];
  workstreams: Array<{ workstream_id: number; workstream_name: string; color_code: string | null }>;
  onFiltersChange: (filters: Partial<TasksFiltersState>) => void;
}
