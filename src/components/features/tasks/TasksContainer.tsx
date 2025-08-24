import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useTasks } from './hooks/useTasks';
import { useTaskTypes } from './hooks/useTaskTypes';
import { useWorkstreams } from './hooks/useWorkstreams';
import { useTaskFilters } from './hooks/useTaskFilters';
import type { TaskWithRelations } from './types';
import LoadingState from '../../shared/LoadingState';
import ErrorState from '../../shared/ErrorState';
import EmptyState from '../../shared/EmptyState';
import TasksFilters from './TasksFilters/TasksFilters';
import TasksTable from './TasksTable/TasksTable';
import TaskDetailModal from './TaskDetailModal';

const TasksContainer: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const queryClient = useQueryClient();

  // Data fetching
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasks();
  const { data: taskTypesData } = useTaskTypes();
  const { data: workstreamsData } = useWorkstreams();

  // Delete mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', taskId);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      alert('Task deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  });

  // State management
  const {
    filters,
    expandedGroups,
    filteredTasks,
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

  // Delete handler
  const handleDeleteTask = (task: TaskWithRelations) => {
    if (task.subtasks && task.subtasks.length > 0) {
      alert('Cannot delete task that has subtasks. Please delete or reassign subtasks first.');
      return;
    }
    
    const confirmed = confirm(`Are you sure you want to delete "${task.task_name}"? This action cannot be undone.`);
    if (confirmed) {
      deleteTaskMutation.mutate(task.task_id);
    }
  };

  // Loading state
  if (tasksLoading) {
    return <LoadingState count={4} />;
  }

  // Error state
  if (tasksError) {
    return <ErrorState error={tasksError as Error} title="Error loading tasks" />;
  }

  // Empty state
  if (!tasksData || tasksData.length === 0) {
    return <EmptyState title="No tasks found" description="There are no tasks available at the moment." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TasksFilters
        filters={filters}
        taskTypes={taskTypesData || []}
        workstreams={workstreamsData || []}
        onFiltersChange={updateFilters}
      />

      {/* Tasks Table */}
      <TasksTable
        tasks={filteredTasks}
        groupBy={filters.groupBy}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
        onTaskClick={openTaskModal}
        onDeleteClick={handleDeleteTask}
      />

      {/* Empty filtered state */}
      {filteredTasks.length === 0 && (
        <EmptyState 
          title="No matching tasks"
          description={
            filters.searchQuery || filters.statusFilter !== 'all' || filters.taskTypeFilter !== 'all' || filters.workstreamFilter !== 'all'
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
