import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, FileText, MessageSquare, Lightbulb } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';
import MeetingConductor from './MeetingConductor';

interface Meeting {
  meeting_id: number;
  meeting_name: string;
  scheduled_date: string;
  duration_minutes: number;
  location_platform: string;
  status: string;
  template_data: any;
  meeting_objectives: string | null;
  key_messages: string | null;
  structured_notes: any;
  unstructured_notes: string | null;
  free_form_insights: string | null;
  meeting_summary: string | null;
  overall_assessment: string | null;
}

interface MeetingType {
  meeting_type_id: number;
  type_name: string;
  description: string;
}

interface Phase {
  phase_id: number;
  phase_name: string;
  phase_number: number;
}

interface Initiative {
  initiative_id: number;
  initiative_name: string;
}

interface MeetingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: number;
  onMeetingUpdated: () => void;
}

const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  onMeetingUpdated
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [meetingType, setMeetingType] = useState<MeetingType | null>(null);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conductor' | 'details' | 'notes'>('conductor');

  useEffect(() => {
    if (isOpen && meetingId) {
      fetchMeetingData();
    }
  }, [isOpen, meetingId]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch meeting with all related data
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_types (
            meeting_type_id,
            type_name,
            description
          ),
          phases (
            phase_id,
            phase_name,
            phase_number
          ),
          initiatives (
            initiative_id,
            initiative_name
          )
        `)
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError) throw meetingError;

      setMeeting(meetingData);
      setMeetingType(meetingData.meeting_types);
      setPhase(meetingData.phases);
      setInitiative(meetingData.initiatives);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting data');
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingUpdate = async (updatedData: Partial<Meeting>) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update(updatedData)
        .eq('meeting_id', meetingId);

      if (error) throw error;

      // Refresh meeting data
      await fetchMeetingData();
      onMeetingUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meeting');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-red-600 text-center">
              Error loading meeting: {error || 'Meeting not found'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{meeting.meeting_name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(meeting.scheduled_date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {meeting.duration_minutes} minutes
              </div>
              {meeting.location_platform && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {meeting.location_platform}
                </div>
              )}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
                {meeting.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('conductor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conductor'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Meeting Conductor
              </div>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Meeting Details
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Notes & Insights
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'conductor' && (
            <MeetingConductor
              meeting={meeting}
              onMeetingUpdate={handleMeetingUpdate}
            />
          )}
          
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Meeting Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="text-sm text-gray-900">{meetingType?.type_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phase</dt>
                      <dd className="text-sm text-gray-900">{phase ? `${phase.phase_number}. ${phase.phase_name}` : 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Initiative</dt>
                      <dd className="text-sm text-gray-900">{initiative?.initiative_name || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Meeting Objectives</dt>
                      <dd className="text-sm text-gray-900">{meeting.meeting_objectives || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Key Messages</dt>
                      <dd className="text-sm text-gray-900">{meeting.key_messages || 'Not specified'}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Template Structure</h3>
                  {meeting.template_data ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(meeting.template_data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No template structure available</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Meeting Summary</h3>
                <textarea
                  value={meeting.meeting_summary || ''}
                  onChange={(e) => handleMeetingUpdate({ meeting_summary: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Summarize the key outcomes and decisions from this meeting..."
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Overall Assessment</h3>
                <textarea
                  value={meeting.overall_assessment || ''}
                  onChange={(e) => handleMeetingUpdate({ overall_assessment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How did this meeting go? What could be improved?"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailModal;
