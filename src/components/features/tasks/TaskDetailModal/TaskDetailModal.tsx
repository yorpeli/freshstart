import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Target, FileText, MessageSquare, ArrowUpRight, ArrowDownRight, Edit, Save, XCircle, Trash2 } from 'lucide-react';
import Badge from '../../../ui/Badge';
import type { TaskWithRelations } from '../types';
import { useTaskTypes } from '../hooks/useTaskTypes';
import { useWorkstreams } from '../hooks/useWorkstreams';
import { usePeopleWithRelations, usePhases } from '../../../../hooks/useSupabaseQuery';
import { supabase } from '../../../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TaskDetailModalProps {
  task: TaskWithRelations;
  isOpen: boolean;
  onClose: () => void;
}

interface TaskEditForm {
  task_name: string;
  description: string;
  status: string;
  priority: number | null;
  start_date: string | null;
  due_date: string | null;
  owner_id: number;
  task_type_id: number | null;
  phase_id: number;
  notes: string | null;
  workstream_ids: number[];
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editForm, setEditForm] = useState<TaskEditForm>(() => ({
    task_name: task.task_name,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    start_date: task.start_date,
    due_date: task.due_date,
    owner_id: task.owner_id,
    task_type_id: task.task_type_id,
    phase_id: task.phase_id,
    notes: task.notes,
    workstream_ids: task.workstreams?.map(w => w.workstream_id) || []
  }));
  
  const queryClient = useQueryClient();
  const { data: taskTypes = [] } = useTaskTypes();
  const { data: workstreams = [] } = useWorkstreams();
  const { data: people = [] } = usePeopleWithRelations();
  const { data: phases = [] } = usePhases();
  
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: Partial<TaskEditForm>) => {
      const { workstream_ids, ...taskFields } = updatedTask;
      
      // Update task fields
      if (Object.keys(taskFields).length > 0) {
        const { data, error } = await supabase
          .from('tasks')
          .update(taskFields)
          .eq('task_id', task.task_id)
          .select()
          .single();
        
        if (error) {
          throw new Error(error.message);
        }
      }
      
      // Update workstreams if they changed
      if (workstream_ids !== undefined) {
        // Delete existing workstream associations
        const { error: deleteError } = await supabase
          .from('task_workstreams')
          .delete()
          .eq('task_id', task.task_id);
        
        if (deleteError) {
          throw new Error(`Error removing workstreams: ${deleteError.message}`);
        }
        
        // Add new workstream associations
        if (workstream_ids.length > 0) {
          const workstreamAssociations = workstream_ids.map(workstream_id => ({
            task_id: task.task_id,
            workstream_id
          }));
          
          const { error: insertError } = await supabase
            .from('task_workstreams')
            .insert(workstreamAssociations);
          
          if (insertError) {
            throw new Error(`Error adding workstreams: ${insertError.message}`);
          }
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', task.task_id);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      alert('Task deleted successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  });
  
  const handleSave = () => {
    const updatedFields: any = {};
    
    // Only include changed fields
    if (editForm.task_name !== task.task_name) updatedFields.task_name = editForm.task_name;
    if (editForm.description !== (task.description || '')) updatedFields.description = editForm.description || null;
    if (editForm.status !== task.status) updatedFields.status = editForm.status;
    if (editForm.priority !== task.priority) updatedFields.priority = editForm.priority;
    if (editForm.start_date !== task.start_date) updatedFields.start_date = editForm.start_date;
    if (editForm.due_date !== task.due_date) updatedFields.due_date = editForm.due_date;
    if (editForm.owner_id !== task.owner_id) updatedFields.owner_id = editForm.owner_id;
    if (editForm.task_type_id !== task.task_type_id) updatedFields.task_type_id = editForm.task_type_id;
    if (editForm.phase_id !== task.phase_id) updatedFields.phase_id = editForm.phase_id;
    if (editForm.notes !== (task.notes || '')) updatedFields.notes = editForm.notes || null;
    const currentWorkstreamIds = task.workstreams?.map(w => w.workstream_id) || [];
    if (JSON.stringify(editForm.workstream_ids.sort()) !== JSON.stringify(currentWorkstreamIds.sort())) {
      updatedFields.workstream_ids = editForm.workstream_ids;
    }
    
    if (Object.keys(updatedFields).length > 0) {
      updateTaskMutation.mutate(updatedFields);
    } else {
      setIsEditing(false);
    }
  };
  
  const resetForm = () => ({
    task_name: task.task_name,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    start_date: task.start_date,
    due_date: task.due_date,
    owner_id: task.owner_id,
    task_type_id: task.task_type_id,
    phase_id: task.phase_id,
    notes: task.notes,
    workstream_ids: task.workstreams?.map(w => w.workstream_id) || []
  });

  const handleCancel = () => {
    setEditForm(resetForm());
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (task.subtasks && task.subtasks.length > 0) {
      alert('Cannot delete task that has subtasks. Please delete or reassign subtasks first.');
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    deleteTaskMutation.mutate();
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Reset form when task changes
  useEffect(() => {
    const newForm = resetForm();
    setEditForm(newForm);
    setIsEditing(false);
  }, [task.task_id, task.task_name, task.description, task.status, task.priority, task.start_date, task.due_date, task.owner_id, task.task_type_id, task.phase_id, task.notes, task.workstreams]);
  
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
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-red-100 text-red-800';
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
            {isEditing ? (
              <input
                type="text"
                value={editForm.task_name}
                onChange={(e) => setEditForm({ ...editForm, task_name: e.target.value })}
                className="text-xl font-semibold text-gray-900 mb-2 w-full bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                placeholder="Task name"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {task.task_name}
              </h2>
            )}
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
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updateTaskMutation.isPending}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600 disabled:opacity-50"
                  title="Save changes"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updateTaskMutation.isPending}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600 disabled:opacity-50"
                  title="Cancel editing"
                >
                  <XCircle size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-600"
                  title="Edit task"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deleteTaskMutation.isPending}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600 disabled:opacity-50"
                  title="Delete task"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status, Priority, and Workstreams */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Status</span>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Priority</span>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editForm.priority || ''}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value ? parseInt(e.target.value) : null })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">No Priority</option>
                    <option value="1">P1 (High)</option>
                    <option value="2">P2 (Medium)</option>
                    <option value="3">P3 (Low)</option>
                  </select>
                ) : (
                  task.priority ? (
                    <Badge className={getPriorityColor(task.priority)}>
                      P{task.priority}
                    </Badge>
                  ) : (
                    <span className="text-gray-500 text-sm">No priority</span>
                  )
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Workstreams</span>
              <div className="mt-1">
                {isEditing ? (
                  <div className="space-y-1">
                    {workstreams.map((workstream) => (
                      <label key={workstream.workstream_id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.workstream_ids.includes(workstream.workstream_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditForm({
                                ...editForm,
                                workstream_ids: [...editForm.workstream_ids, workstream.workstream_id]
                              });
                            } else {
                              setEditForm({
                                ...editForm,
                                workstream_ids: editForm.workstream_ids.filter(id => id !== workstream.workstream_id)
                              });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-xs text-gray-700">{workstream.workstream_name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  task.workstreams && task.workstreams.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.workstreams.map((workstream) => (
                        <Badge 
                          key={workstream.workstream_id} 
                          className="text-white text-xs"
                          style={{ backgroundColor: workstream.color_code || '#6B7280' }}
                        >
                          {workstream.workstream_name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs italic">No workstreams</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-sm font-medium text-gray-500">Description</span>
            <div className="mt-2">
              {isEditing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none resize-vertical"
                  rows={3}
                  placeholder="Task description"
                />
              ) : (
                task.description ? (
                  <p className="text-gray-700 leading-relaxed">{task.description}</p>
                ) : (
                  <span className="text-gray-500 text-sm italic">No description</span>
                )
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Start Date</span>
              <div className="mt-1 flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.start_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value || null })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-700">{formatDate(task.start_date)}</p>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Due Date</span>
              <div className="mt-1 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.due_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value || null })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-gray-700">{formatDate(task.due_date)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Owner */}
          <div>
            <span className="text-sm font-medium text-gray-500">Owner</span>
            <div className="mt-1 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              {isEditing ? (
                <select
                  value={editForm.owner_id}
                  onChange={(e) => setEditForm({ ...editForm, owner_id: parseInt(e.target.value) })}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                >
                  {people.map((person) => (
                    <option key={person.person_id} value={person.person_id}>
                      {person.first_name} {person.last_name || ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-700">{task.owner_name}</p>
              )}
            </div>
          </div>

          {/* Phase and Task Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Phase</span>
              <div className="mt-1 flex items-center gap-2">
                <Target size={16} className="text-gray-400" />
                {isEditing ? (
                  <select
                    value={editForm.phase_id}
                    onChange={(e) => setEditForm({ ...editForm, phase_id: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    {phases.map((phase) => (
                      <option key={phase.phase_id} value={phase.phase_id}>
                        {phase.phase_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-700">{task.phase_name}</p>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Task Type</span>
              <div className="mt-1 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                {isEditing ? (
                  <select
                    value={editForm.task_type_id || ''}
                    onChange={(e) => setEditForm({ ...editForm, task_type_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">No Type</option>
                    {taskTypes.map((type) => (
                      <option key={type.task_type_id} value={type.task_type_id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-700">{task.task_type?.type_name || 'No type'}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Initiative (read-only) */}
          {task.initiative_name && (
            <div>
              <span className="text-sm font-medium text-gray-500">Initiative</span>
              <div className="mt-1 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" />
                <p className="text-gray-700">{task.initiative_name}</p>
              </div>
            </div>
          )}



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
          <div>
            <span className="text-sm font-medium text-gray-500">Notes</span>
            <div className="mt-2">
              {isEditing ? (
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value || null })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none resize-vertical"
                  rows={3}
                  placeholder="Task notes"
                />
              ) : (
                task.notes ? (
                  <p className="text-gray-700 leading-relaxed">{task.notes}</p>
                ) : (
                  <span className="text-gray-500 text-sm italic">No notes</span>
                )
              )}
            </div>
          </div>

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

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Task</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{task.task_name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleteTaskMutation.isPending}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteTaskMutation.isPending}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal;
