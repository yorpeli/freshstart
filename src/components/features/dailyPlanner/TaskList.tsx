import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Plus } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { useDailyPlannerTasks, useTaskDetail } from '../../../hooks/useDailyPlannerTasks';
import { LoadingState, ErrorState } from '../../shared';
import TaskDetailModal from '../tasks/TaskDetailModal';

interface TaskListProps {
  selectedDate: Date;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use real data from the database
  const { data: tasks = [], isLoading, error } = useDailyPlannerTasks(selectedDate);
  
  // Fetch the selected task details when modal is open
  const { data: selectedTask } = useTaskDetail(selectedTaskId);

  const openTaskModal = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setSelectedTaskId(null);
    setIsModalOpen(false);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 border-red-200';
      case 2:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'High';
      case 2:
        return 'Medium';
      case 3:
        return 'Low';
      default:
        return 'Low';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'not_started':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const isOverdue = (date: Date) => {
    return date < new Date() && !isToday(date);
  };

  const sortedTasks = tasks.sort((a, b) => {
    // Sort by priority first, then by due date
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          message="Failed to load tasks" 
          error={error instanceof Error ? error : new Error(String(error))}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <div className="text-sm text-gray-500">
          {sortedTasks.length} of {tasks.length}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => openTaskModal(task.id)}
            className={`p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
              isOverdue(new Date(task.dueDate)) ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(task.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {task.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-2 flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.estimatedMinutes ? `${task.estimatedMinutes}m` : 'No estimate'}
                    </span>
                    <span>{task.phase}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {isOverdue(new Date(task.dueDate)) ? (
                      <span className="text-red-600 font-medium">Overdue</span>
                    ) : (
                      format(new Date(task.dueDate), 'MMM d')
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {sortedTasks.length === 0 && (
          <div className="text-center py-8">
            <Circle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No tasks for this date
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full text-center p-3 bg-primary-50 border border-primary-200 rounded-lg text-primary-700 hover:bg-primary-100 transition-colors">
          <Plus className="h-4 w-4 inline mr-2" />
          Add New Task
        </button>
      </div>

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

export default TaskList;
