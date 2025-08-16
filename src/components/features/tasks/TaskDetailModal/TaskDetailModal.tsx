import React from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Target, 
  Clock, 
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  Users
} from 'lucide-react';
import type { Task, TaskType } from '../../../lib/types';
import Badge from '../../ui/Badge';
import Card from '../../ui/Card';

interface TaskWithRelations extends Task {
  task_type: TaskType;
  owner_name: string;
  phase_name: string;
  initiative_name: string;
}

interface TaskDetailModalProps {
  task: TaskWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  if (!isOpen) return null;

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
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {task.task_name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {task.task_type && (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.task_type.color_code || '#6B7280' }}
                  />
                  <span className="text-sm text-gray-600 capitalize">{task.task_type.type_name}</span>
                </div>
              )}
              {task.source_meeting_id && (
                <Badge className="bg-orange-100 text-orange-800">Action Item</Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Status</span>
              <div className="mt-1">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            {task.priority && (
              <div>
                <span className="text-sm font-medium text-gray-500">Priority</span>
                <div className="mt-1">
                  <Badge className={getPriorityColor(task.priority)}>
                    P{task.priority}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Description</span>
              </div>
              <p className="text-gray-700 leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Start Date</span>
              </div>
              <p className="text-gray-700">{formatDate(task.start_date)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Due Date</span>
              </div>
              <p className="text-gray-700">{formatDate(task.due_date)}</p>
            </div>
          </div>

          {/* Owner */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-500">Owner</span>
            </div>
            <p className="text-gray-700">{task.owner_name}</p>
          </div>

          {/* Phase and Initiative */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Phase</span>
              </div>
              <p className="text-gray-700">{task.phase_name}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Initiative</span>
              </div>
              <p className="text-gray-700">{task.initiative_name || 'Not assigned'}</p>
            </div>
          </div>

          {/* Hierarchy Information */}
          {(task.parent_task_id || (task.subtasks && task.subtasks.length > 0)) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpRight size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Task Hierarchy</span>
              </div>
              <Card className="bg-gray-50">
                <div className="p-4 space-y-2">
                  {task.parent_task_id && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ArrowUpRight size={14} />
                      <span>Subtask of: <span className="font-medium">Parent Task</span></span>
                    </div>
                  )}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ArrowDownLeft size={14} />
                      <span>Has {task.subtasks.length} subtask{task.subtasks.length > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Notes</span>
              </div>
              <Card className="bg-gray-50">
                <div className="p-4">
                  <p className="text-gray-700 leading-relaxed">{task.notes}</p>
                </div>
              </Card>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {formatDate(task.created_at)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(task.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
