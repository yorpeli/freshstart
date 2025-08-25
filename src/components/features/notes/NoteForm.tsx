import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui';
import { RichTextEditor } from './';
import type { NoteWithRelationships, CreateNoteData } from '../../../lib/types';

interface NoteFormProps {
  mode: 'create' | 'edit';
  note?: NoteWithRelationships;
  onSubmit: (noteData: CreateNoteData) => void;
  onCancel: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ mode, note, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateNoteData>({
    header: '',
    body: '',
    tags: [],
    importance: 'medium',
    connected_phases: [],
    connected_meetings: [],
    connected_initiatives: [],
    connected_workstreams: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (note && mode === 'edit') {
      setFormData({
        header: note.header,
        body: note.body,
        tags: note.tags || [],
        importance: note.importance,
        connected_phases: note.connected_phases?.map(p => p.phase_id) || [],
        connected_meetings: note.connected_meetings?.map(m => m.meeting_id) || [],
        connected_initiatives: note.connected_initiatives?.map(i => i.initiative_id) || [],
        connected_workstreams: note.connected_workstreams?.map(w => w.workstream_id) || []
      });
    }
  }, [note, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.header.trim() && formData.body.trim()) {
      onSubmit(formData);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const importanceOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={mode === 'create' ? 'Create New Note' : 'Edit Note'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div>
          <label htmlFor="header" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="header"
            value={formData.header}
            onChange={(e) => setFormData(prev => ({ ...prev, header: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter note title..."
            required
          />
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <RichTextEditor
            value={formData.body}
            onChange={(value) => setFormData(prev => ({ ...prev, body: value }))}
            placeholder="Start writing your note..."
          />
        </div>

        {/* Importance */}
        <div>
          <label htmlFor="importance" className="block text-sm font-medium text-gray-700 mb-2">
            Importance
          </label>
          <select
            id="importance"
            value={formData.importance}
            onChange={(e) => setFormData(prev => ({ ...prev, importance: e.target.value as any }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {importanceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Entity Connections - Placeholder for now */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connect to (Coming in Phase 4)
          </label>
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            Entity connection functionality will be implemented in Phase 4.
            For now, notes can be created independently and connected later.
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!formData.header.trim() || !formData.body.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mode === 'create' ? 'Create Note' : 'Update Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NoteForm;
