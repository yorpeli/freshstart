// Main components
export { default as TasksContainer } from './TasksContainer';
export { default as TasksTable } from './TasksTable';
export { default as TasksFilters } from './TasksFilters';
export { default as TaskDetailModal } from './TaskDetailModal';
export { useTasks } from './hooks/useTasks';
export { useTaskTypes } from './hooks/useTaskTypes';
export { useWorkstreams } from './hooks/useWorkstreams';
export { useTaskFilters } from './hooks/useTaskFilters';
export type { TaskWithRelations, TasksFiltersState, TasksTableProps, TasksFiltersProps } from './types';

// Task Distribution View
export { 
  TaskDistributionView, 
  TaskDayView, 
  TaskDistributionHeader, 
  TaskPriorityBadge 
} from './TaskDistributionView';
