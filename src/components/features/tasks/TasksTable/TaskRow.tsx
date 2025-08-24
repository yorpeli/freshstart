import React from 'react';
import type { TaskWithRelations } from '../types';
import Badge from '../../../ui/Badge';

interface TaskRowProps {
  task: TaskWithRelations;
  level?: number;
  onTaskClick: (task: TaskWithRelations) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, level = 0, onTaskClick }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number | null): string => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    switch (priority) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className={`flex items-center ${level > 0 ? `ml-${level * 4}` : ''}`}>
            {level > 0 && (
              <div className="w-4 h-4 mr-2 border-l-2 border-b-2 border-gray-300"></div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onTaskClick(task)}
                className="text-sm font-medium text-gray-900 max-w-md truncate hover:text-primary-600 transition-colors text-left"
              >
                {task.task_name}
              </button>
              {task.source_meeting_id && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">AI</Badge>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap">
          {task.task_type && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: task.task_type.color_code || '#6B7280' }}
              />
              <span className="text-sm text-gray-600 capitalize">{task.task_type.type_name}</span>
            </div>
          )}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          {task.priority && (
            <Badge className={getPriorityColor(task.priority)}>
              P{task.priority}
            </Badge>
          )}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {task.owner_name}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {formatDate(task.start_date)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {formatDate(task.due_date)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <div className="max-w-xs truncate">
            {task.phase_name}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <div className="max-w-xs truncate">
            {task.initiative_name}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {task.subtasks && task.subtasks.length > 0 && (
            <span>{task.subtasks.length} subtask{task.subtasks.length > 1 ? 's' : ''}</span>
          )}
        </td>
      </tr>
      
      {/* Render subtasks */}
      {task.subtasks && task.subtasks.map(subtask => (
        <TaskRow key={subtask.task_id} task={subtask} level={level + 1} onTaskClick={onTaskClick} />
      ))}
    </>
  );
};

export default TaskRow;
