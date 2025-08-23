import React, { useState, useEffect } from 'react';
import { X, User, Building, Users, Mail, Edit, Save, XCircle, UserCheck, UserMinus, UserX, Trash2 } from 'lucide-react';
import Badge from '../../../../ui/Badge';
import SearchableManagerDropdown from '../SearchableManagerDropdown';
import type { Person } from '../../../../../lib/types';
import { usePeopleWithRelations, useDepartments } from '../../../../../hooks/useSupabaseQuery';
import { supabase } from '../../../../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PersonDetailModalProps {
  person: Person;
  isOpen: boolean;
  onClose: () => void;
}

interface PersonEditForm {
  first_name: string;
  last_name: string;
  role_title: string;
  department_id: number | null;
  reporting_manager_id: number | null;
  email: string;
  engagement_priority: number;
  influence_level: number;
}

const PersonDetailModal: React.FC<PersonDetailModalProps> = ({ person, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [editForm, setEditForm] = useState<PersonEditForm>(() => ({
    first_name: person.first_name || '',
    last_name: person.last_name || '',
    role_title: person.role_title || '',
    department_id: person.department_id,
    reporting_manager_id: person.reporting_manager_id,
    email: person.email || '',
    engagement_priority: person.engagement_priority || 0,
    influence_level: person.influence_level || 0
  }));
  
  const queryClient = useQueryClient();
  const { data: people = [] } = usePeopleWithRelations();
  const { data: departments = [] } = useDepartments();
  
  const updatePersonMutation = useMutation({
    mutationFn: async (updatedPerson: Partial<PersonEditForm>) => {
      const { data, error } = await supabase
        .from('people')
        .update(updatedPerson)
        .eq('person_id', person.person_id)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Error updating person:', error);
      alert('Failed to update person. Please try again.');
    }
  });

  const deletePersonMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('person_id', person.person_id);
      
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
      alert('Person deleted successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Error deleting person:', error);
      alert('Failed to delete person. Please try again.');
    }
  });
  
  const handleSave = () => {
    // Basic validation
    if (!editForm.first_name.trim()) {
      alert('First name is required');
      return;
    }
    
    if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Prevent manager self-reference
    if (editForm.reporting_manager_id === person.person_id) {
      alert('A person cannot be their own manager');
      return;
    }
    
    const updatedFields: Partial<PersonEditForm> = {};
    
    // Only include changed fields
    if (editForm.first_name !== (person.first_name || '')) updatedFields.first_name = editForm.first_name || undefined;
    if (editForm.last_name !== (person.last_name || '')) updatedFields.last_name = editForm.last_name || undefined;
    if (editForm.role_title !== (person.role_title || '')) updatedFields.role_title = editForm.role_title || undefined;
    if (editForm.department_id !== person.department_id) updatedFields.department_id = editForm.department_id;
    if (editForm.reporting_manager_id !== person.reporting_manager_id) updatedFields.reporting_manager_id = editForm.reporting_manager_id;
    if (editForm.email !== (person.email || '')) updatedFields.email = editForm.email || undefined;
    if (editForm.engagement_priority !== (person.engagement_priority || 0)) updatedFields.engagement_priority = editForm.engagement_priority;
    if (editForm.influence_level !== (person.influence_level || 0)) updatedFields.influence_level = editForm.influence_level;
    
    if (Object.keys(updatedFields).length > 0) {
      updatePersonMutation.mutate(updatedFields);
    } else {
      setIsEditing(false);
    }
  };
  
  const resetForm = () => ({
    first_name: person.first_name || '',
    last_name: person.last_name || '',
    role_title: person.role_title || '',
    department_id: person.department_id,
    reporting_manager_id: person.reporting_manager_id,
    email: person.email || '',
    engagement_priority: person.engagement_priority || 0,
    influence_level: person.influence_level || 0
  });

  const handleCancel = () => {
    setEditForm(resetForm());
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (person.direct_reports && person.direct_reports.length > 0) {
      alert('Cannot delete person who has direct reports. Please reassign their reports first.');
      return;
    }
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    deletePersonMutation.mutate();
    setShowDeleteConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  // Reset form when person changes
  useEffect(() => {
    const newForm = resetForm();
    setEditForm(newForm);
    setIsEditing(false);
  }, [person.person_id, person.first_name, person.last_name, person.role_title, person.department_id, person.reporting_manager_id, person.email, person.engagement_priority, person.influence_level]);
  
  if (!isOpen) return null;

  const getEngagementColor = (engagement: number): string => {
    switch (engagement) {
      case 5: return 'bg-green-100 text-green-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 1: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInfluenceColor = (influence: number): string => {
    switch (influence) {
      case 5: return 'bg-purple-100 text-purple-800';
      case 4: return 'bg-indigo-100 text-indigo-800';
      case 3: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-teal-100 text-teal-800';
      case 1: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementIcon = (engagement: number) => {
    if (engagement >= 4) return <UserCheck className="text-green-600" size={16} />;
    if (engagement === 3) return <UserMinus className="text-yellow-600" size={16} />;
    if (engagement >= 1) return <UserX className="text-red-600" size={16} />;
    return <User className="text-gray-400" size={16} />;
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

  const availableManagers = people.filter((p: Person) => p.person_id !== person.person_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={20} className="text-gray-600" />
              </div>
              <div>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="text-xl font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                      placeholder="First name"
                    />
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="text-xl font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none"
                      placeholder="Last name"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900">
                    {person.first_name} {person.last_name}
                  </h2>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.role_title}
                    onChange={(e) => setEditForm({ ...editForm, role_title: e.target.value })}
                    className="text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none mt-1"
                    placeholder="Role title"
                  />
                ) : (
                  <p className="text-sm text-gray-600">{person.role_title || 'No role specified'}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getEngagementIcon(person.engagement_priority || 0)}
              <span className="text-sm text-gray-600">
                {person.department?.department_name || 'Unknown Department'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updatePersonMutation.isPending}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600 disabled:opacity-50"
                  title="Save changes"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updatePersonMutation.isPending}
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
                  title="Edit person"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={deletePersonMutation.isPending}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600 disabled:opacity-50"
                  title="Delete person"
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
          {/* Engagement and Influence */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Engagement</span>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editForm.engagement_priority}
                    onChange={(e) => setEditForm({ ...editForm, engagement_priority: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="0">No Priority</option>
                    <option value="1">Critical (1)</option>
                    <option value="2">High (2)</option>
                    <option value="3">Medium (3)</option>
                    <option value="4">Low (4)</option>
                    <option value="5">Minimal (5)</option>
                  </select>
                ) : (
                  <Badge className={getEngagementColor(person.engagement_priority || 0)}>
                    Level {person.engagement_priority || 0}
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Influence</span>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    value={editForm.influence_level}
                    onChange={(e) => setEditForm({ ...editForm, influence_level: parseInt(e.target.value) })}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    <option value="0">No Level</option>
                    <option value="1">Low (1)</option>
                    <option value="2">Medium-Low (2)</option>
                    <option value="3">Medium (3)</option>
                    <option value="4">Medium-High (4)</option>
                    <option value="5">High (5)</option>
                  </select>
                ) : (
                  <Badge className={getInfluenceColor(person.influence_level || 0)}>
                    Level {person.influence_level || 0}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <span className="text-sm font-medium text-gray-500">Email</span>
            <div className="mt-1 flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none flex-1"
                  placeholder="email@company.com"
                />
              ) : (
                <p className="text-gray-700">{person.email || 'No email'}</p>
              )}
            </div>
          </div>

          {/* Department */}
          <div>
            <span className="text-sm font-medium text-gray-500">Department</span>
            <div className="mt-1 flex items-center gap-2">
              <Building size={16} className="text-gray-400" />
              {isEditing ? (
                <select
                  value={editForm.department_id || ''}
                  onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="">No Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-700">{person.department?.department_name || 'No department'}</p>
              )}
            </div>
          </div>

          {/* Manager */}
          <div>
            <span className="text-sm font-medium text-gray-500">Reports To</span>
            <div className="mt-1 flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              {isEditing ? (
                <div className="flex-1">
                  <SearchableManagerDropdown
                    people={availableManagers}
                    selectedManagerId={editForm.reporting_manager_id}
                    onSelect={(managerId) => setEditForm({ ...editForm, reporting_manager_id: managerId })}
                    placeholder="Select manager..."
                  />
                </div>
              ) : (
                <p className="text-gray-700">
                  {person.reports_to ? `${person.reports_to.first_name} ${person.reports_to.last_name}` : 'No manager'}
                </p>
              )}
            </div>
          </div>

          {/* Direct Reports */}
          {person.direct_reports && person.direct_reports.length > 0 && (
            <div>
              <span className="text-sm font-medium text-gray-500">Direct Reports</span>
              <div className="mt-2 flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {person.direct_reports.map((report: Person) => (
                    <Badge key={report.person_id} className="bg-blue-100 text-blue-800">
                      {report.first_name} {report.last_name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {formatDate(person.created_at)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(person.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirmation && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Person</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{person.first_name} {person.last_name}</strong>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deletePersonMutation.isPending}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletePersonMutation.isPending}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
                >
                  {deletePersonMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonDetailModal;