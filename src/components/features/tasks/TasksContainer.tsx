import React, { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useTaskTypes } from './hooks/useTaskTypes';
import { useTaskFilters } from './hooks/useTaskFilters';
import type { TaskWithRelations } from './types';
import LoadingState from '../../shared/LoadingState';
import ErrorState from '../../shared/ErrorState';
import EmptyState from '../../shared/EmptyState';
import { TasksFilters } from './TasksFilters';
import { TasksTable } from './TasksTable';
import TaskDetailModal from './TaskDetailModal';

const TasksContainer: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data fetching
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasks();
  const { data: taskTypesData } = useTaskTypes();

  // State management
  const {
    filters,
    expandedGroups,
    filteredTasks,
    groupedTasks,
    updateFilters,
    toggleGroup
  } = useTaskFilters(tasksData || []);

  // Modal handlers
  const openTaskModal = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  // Loading state
  if (tasksLoading) {
    return <LoadingState message="Loading tasks..." />;
  }

  // Error state
  if (tasksError) {
    return <ErrorState error={tasksError as Error} title="Error loading tasks" />;
  }

  // Empty state
  if (!tasksData || tasksData.length === 0) {
    return <EmptyState message="No tasks found" />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TasksFilters
        filters={filters}
        taskTypes={taskTypesData || []}
        onFiltersChange={updateFilters}
      />

      {/* Tasks Table */}
      <TasksTable
        tasks={filteredTasks}
        groupBy={filters.groupBy}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
        onTaskClick={openTaskModal}
      />

      {/* Empty filtered state */}
      {filteredTasks.length === 0 && (
        <EmptyState 
          message={
            filters.searchQuery || filters.statusFilter !== 'all' || filters.taskTypeFilter !== 'all' 
              ? "No tasks match your filters" 
              : "No tasks found"
          }
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={closeTaskModal}
        />
      )}
    </div>
  );
};

export default TasksContainer;
