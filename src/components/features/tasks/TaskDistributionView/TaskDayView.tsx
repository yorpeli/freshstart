import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import type { TaskWithRelations } from '../types';

interface TaskDayViewProps {
  date: Date;
  tasks: TaskWithRelations[];
  isToday: boolean;
  onTaskClick?: (task: TaskWithRelations) => void;
}

export const TaskDayView: React.FC<TaskDayViewProps> = ({
  date,
  tasks,
  isToday,
  onTaskClick
}) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const isOverdue = (task: TaskWithRelations) => {
    if (!task.due_date || task.status === 'completed') return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    return dueDate < today;
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${
      isToday ? 'ring-2 ring-blue-500 shadow-lg' : 'border-gray-200'
    }`}>
      {/* Day Header */}
      <div className="text-center mb-4">
        <div className={`text-2xl font-bold ${
          isToday ? 'text-blue-600' : 'text-gray-900'
        }`}>
          {format(date, 'd')}
        </div>
        <div className="text-sm text-gray-500">
          {format(date, 'EEE')}
        </div>
        {isToday && (
          <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Today
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-sm text-gray-400">No tasks</div>
          </div>
        ) : (
          tasks.map((task) => {
            const overdue = isOverdue(task);
            const displayStatus = overdue ? 'overdue' : task.status;
            
            return (
              <div
                key={task.task_id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:border-gray-300 active:scale-95 ${
                  overdue ? 'border-red-200 bg-red-50 hover:bg-red-100' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => onTaskClick?.(task)}
                title="Click to edit task"
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(displayStatus)}
                    <span className={`text-xs font-medium ${getStatusColor(displayStatus)}`}>
                      {displayStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <TaskPriorityBadge priority={task.priority} />
                </div>

                {/* Task Name */}
                <div className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                  {task.task_name}
                </div>

                {/* Overdue Warning */}
                {overdue && (
                  <div className="text-xs text-red-600 font-medium">
                    Overdue by {Math.ceil((new Date().getTime() - new Date(task.due_date!).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Day Summary */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>P3: {tasks.filter(t => t.priority === 3).length}</span>
            <span>P2: {tasks.filter(t => t.priority === 2).length}</span>
            <span>P1: {tasks.filter(t => t.priority === 1).length}</span>
          </div>
        </div>
      )}
    </div>
  );
};
