import React, { useState } from 'react';
import { X, Calendar, Clock, User, Target, FileText, MessageSquare, Lightbulb, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Modal from '../../../ui/Modal';
import Badge from '../../../ui/Badge';
import type { TaskWithRelations } from '../types';
import Card from '../../../ui/Card';

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
              <span className="text-sm font-medium text-gray-500">Description</span>
              <div className="mt-2">
                <p className="text-gray-700 leading-relaxed">{task.description}</p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Start Date</span>
              <div className="mt-1 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <p className="text-gray-700">{formatDate(task.start_date)}</p>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Due Date</span>
              <div className="mt-1 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <p className="text-gray-700">{formatDate(task.due_date)}</p>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <span className="text-sm font-medium text-gray-500">Owner</span>
            <div className="mt-1 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <p className="text-gray-700">{task.owner_name}</p>
            </div>
          </div>

          {/* Phase and Initiative */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Phase</span>
              <div className="mt-1 flex items-center gap-2">
                <Target size={16} className="text-gray-400" />
                <p className="text-gray-700">{task.phase_name}</p>
              </div>
            </div>
            {task.initiative_name && (
              <div>
                <span className="text-sm font-medium text-gray-500">Initiative</span>
                <div className="mt-1 flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" />
                  <p className="text-gray-700">{task.initiative_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Task Relationships */}
          {(task.parent_task_id || (task.subtasks && task.subtasks.length > 0)) && (
            <div>
              <span className="text-sm font-medium text-gray-500">Task Relationships</span>
              <div className="mt-2 space-y-2">
                {task.parent_task_id && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ArrowUpRight size={14} />
                    <span>Subtask of another task</span>
                  </div>
                )}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ArrowDownRight size={14} />
                    <span>Has {task.subtasks.length} subtask{task.subtasks.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div>
              <span className="text-sm font-medium text-gray-500">Notes</span>
              <div className="mt-2">
                <p className="text-gray-700 leading-relaxed">{task.notes}</p>
              </div>
            </div>
          )}

          {/* Source Meeting */}
          {task.source_meeting_id && (
            <div>
              <span className="text-sm font-medium text-gray-500">Source Meeting</span>
              <div className="mt-1 flex items-center gap-2">
                <MessageSquare size={16} className="text-gray-400" />
                <p className="text-gray-700">Action item from meeting #{task.source_meeting_id}</p>
              </div>
            </div>
          )}

          {/* Workstreams */}
          {task.workstreams && task.workstreams.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-500">Workstreams</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {task.workstreams.map((workstream) => (
                  <Badge key={workstream.workstream_id} className="bg-purple-100 text-purple-800">
                    {workstream.workstream_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {formatDate(task.created_at)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(task.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
