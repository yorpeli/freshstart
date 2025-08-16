// Main components
export { default as TasksContainer } from './TasksContainer';
export { default as TaskDetailModal } from './TaskDetailModal';
export { TasksFilters } from './TasksFilters';
export { TasksTable, TaskRow, TasksTableHeader } from './TasksTable';

// Hooks
export { useTasks } from './hooks/useTasks';
export { useTaskTypes } from './hooks/useTaskTypes';
export { useTaskFilters } from './hooks/useTaskFilters';

// Types
export type { 
  TaskWithRelations, 
  TasksFiltersState, 
  TasksTableProps, 
  TasksFiltersProps 
} from './types';
