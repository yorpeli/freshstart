import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import MeetingTypeSelector from './MeetingTypeSelector';
import AttendeeSelector from './AttendeeSelector';

interface Phase {
  phase_id: number;
  phase_name: string;
  phase_number: number;
}

interface Initiative {
  initiative_id: number;
  initiative_name: string;
  phase_id: number;
}

interface Attendee {
  person_id: number;
  first_name: string;
  last_name: string | null;
  email: string | null;
  role_title: string | null;
  department_id: number | null;
  department_name: string;
  role_in_meeting: 'organizer' | 'required' | 'optional';
}

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated: () => void;
}

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingCreated
}) => {
  const [formData, setFormData] = useState({
    meeting_name: '',
    meeting_type_id: null as number | null,
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    location_platform: '',
    phase_id: null as number | null,
    initiative_id: null as number | null,
    meeting_objectives: '',
    key_messages: ''
  });

  const [phases, setPhases] = useState<Phase[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showTemplateCustomization, setShowTemplateCustomization] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPhases();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.phase_id) {
      fetchInitiatives(formData.phase_id);
    } else {
      setInitiatives([]);
      setFormData(prev => ({ ...prev, initiative_id: null }));
    }
  }, [formData.phase_id]);

  const fetchPhases = async () => {
    try {
      const { data, error } = await supabase
        .from('phases')
        .select('phase_id, phase_name, phase_number')
        .order('phase_number');

      if (error) throw error;
      setPhases(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phases');
    }
  };

  const fetchInitiatives = async (phaseId: number) => {
    try {
      const { data, error } = await supabase
        .from('initiatives')
        .select('initiative_id, initiative_name, phase_id')
        .eq('phase_id', phaseId)
        .order('initiative_name');

      if (error) throw error;
      setInitiatives(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch initiatives');
    }
  };

  const handleTypeSelect = (typeId: number, duration: number, template: any) => {
    setFormData(prev => ({
      ...prev,
      meeting_type_id: typeId,
      duration_minutes: duration
    }));
    setSelectedTemplate(template);
    setShowTemplateCustomization(false); // Changed to false - collapsed by default
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.meeting_type_id || !formData.meeting_name || !formData.scheduled_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Combine date and time
      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}`;

      // Get the selected meeting type to copy template
      const { data: meetingTypeData } = await supabase
        .from('meeting_types')
        .select('template_structure')
        .eq('meeting_type_id', formData.meeting_type_id)
        .single();

      // Use customized template if available, otherwise use original
      const templateData = selectedTemplate || meetingTypeData?.template_structure;

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          meeting_name: formData.meeting_name,
          meeting_type_id: formData.meeting_type_id,
          scheduled_date: scheduledDateTime,
          duration_minutes: formData.duration_minutes,
          location_platform: formData.location_platform,
          phase_id: formData.phase_id,
          initiative_id: formData.initiative_id,
          meeting_objectives: formData.meeting_objectives,
          key_messages: formData.key_messages,
          template_data: templateData,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      // Save attendees if any were selected
      if (attendees.length > 0) {
        const attendeeData = attendees.map(attendee => ({
          meeting_id: data.meeting_id,
          person_id: attendee.person_id,
          role_in_meeting: attendee.role_in_meeting
        }));

        const { error: attendeeError } = await supabase
          .from('meeting_attendees')
          .insert(attendeeData);

        if (attendeeError) throw attendeeError;
      }

      // Reset form and close modal
      setFormData({
        meeting_name: '',
        meeting_type_id: null,
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 30,
        location_platform: '',
        phase_id: null,
        initiative_id: null,
        meeting_objectives: '',
        key_messages: ''
      });
      setSelectedTemplate(null);
      setShowTemplateCustomization(false);
      setAttendees([]); // Reset attendees

      onMeetingCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Meeting Type Selection */}
          <MeetingTypeSelector
            selectedTypeId={formData.meeting_type_id}
            onTypeSelect={handleTypeSelect}
          />

          {/* Template Customization */}
          {selectedTemplate && (
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">Template Customization</h3>
                <button
                  type="button"
                  onClick={() => setShowTemplateCustomization(!showTemplateCustomization)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showTemplateCustomization ? 'Hide' : 'Customize'} Template
                </button>
              </div>
              
              {showTemplateCustomization && (
                <div className="space-y-4">
                  {/* Key Messages Customization */}
                  {selectedTemplate.key_messages && Array.isArray(selectedTemplate.key_messages) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Messages
                      </label>
                      <div className="space-y-2">
                        {selectedTemplate.key_messages.map((message: string, index: number) => (
                          <input
                            key={index}
                            type="text"
                            value={message}
                            onChange={(e) => {
                              const newTemplate = { ...selectedTemplate };
                              newTemplate.key_messages[index] = e.target.value;
                              setSelectedTemplate(newTemplate);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter key message"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meeting Objectives Customization */}
                  {selectedTemplate.meeting_objectives && Array.isArray(selectedTemplate.meeting_objectives) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meeting Objectives
                      </label>
                      <div className="space-y-2">
                        {selectedTemplate.meeting_objectives.map((objective: string, index: number) => (
                          <input
                            key={index}
                            type="text"
                            value={objective}
                            onChange={(e) => {
                              const newTemplate = { ...selectedTemplate };
                              newTemplate.meeting_objectives[index] = e.target.value;
                              setSelectedTemplate(newTemplate);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter meeting objective"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expected Outputs Customization */}
                  {selectedTemplate.expected_outputs && Array.isArray(selectedTemplate.expected_outputs) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Outcomes
                      </label>
                      <div className="space-y-2">
                        {selectedTemplate.expected_outputs.map((output: string, index: number) => (
                          <input
                            key={index}
                            type="text"
                            value={output}
                            onChange={(e) => {
                              const newTemplate = { ...selectedTemplate };
                              newTemplate.expected_outputs[index] = e.target.value;
                              setSelectedTemplate(newTemplate);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter expected outcome"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Meeting Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meeting Name *
            </label>
            <input
              type="text"
              value={formData.meeting_name}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter meeting name"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <div className="mt-1 relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Duration and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                min="15"
                step="15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location/Platform
              </label>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.location_platform}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_platform: e.target.value }))}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Conference Room A, Zoom, etc."
                />
              </div>
            </div>
          </div>

          {/* Phase and Initiative */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phase
              </label>
              <select
                value={formData.phase_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  phase_id: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a phase</option>
                {phases.map((phase) => (
                  <option key={phase.phase_id} value={phase.phase_id}>
                    {phase.phase_number}. {phase.phase_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Initiative
              </label>
              <select
                value={formData.initiative_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  initiative_id: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={!formData.phase_id}
              >
                <option value="">Select an initiative</option>
                {initiatives.map((initiative) => (
                  <option key={initiative.initiative_id} value={initiative.initiative_id}>
                    {initiative.initiative_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meeting Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Meeting Objectives
            </label>
            <textarea
              value={formData.meeting_objectives}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_objectives: e.target.value }))}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="What do you want to learn from this meeting?"
            />
          </div>

          {/* Key Messages */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Messages
            </label>
            <textarea
              value={formData.key_messages}
              onChange={(e) => setFormData(prev => ({ ...prev, key_messages: e.target.value }))}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="What key messages should be communicated?"
            />
          </div>

          {/* Attendees */}
          <AttendeeSelector 
            attendees={attendees} 
            onAttendeesChange={setAttendees} 
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;
