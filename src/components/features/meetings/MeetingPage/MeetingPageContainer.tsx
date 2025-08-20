import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import MeetingHeader from './MeetingHeader';
import MeetingStatusCard from './MeetingStatusCard';
import { useMeetingPermissions } from './useMeetingPermissions';

interface DetailedMeeting {
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
  meeting_type_id: number;
  phase_id: number;
  initiative_id: number | null;
  created_at: string;
  updated_at: string;
}

interface MeetingType {
  meeting_type_id: number;
  type_name: string;
  description: string;
  template_structure: any;
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

interface Attendee {
  person_id: number;
  first_name: string;
  last_name: string;
  role_in_meeting: string;
  attendance_status: string;
  email: string | null;
  role_title: string | null;
  department_name: string;
}

interface MeetingDetailResponse {
  meeting: DetailedMeeting & {
    meeting_types: MeetingType;
    phases: Phase;
    initiatives: Initiative | null;
  };
  attendees: Attendee[];
}

interface MeetingPageContainerProps {
  meetingId: number;
}

const useMeetingDetail = (meetingId: number) => {
  return useQuery({
    queryKey: ['meeting-detail', meetingId],
    queryFn: async (): Promise<MeetingDetailResponse> => {
      // Fetch meeting with related data
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_types (
            meeting_type_id,
            type_name,
            description,
            template_structure
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

      if (meetingError) {
        throw new Error(`Error fetching meeting: ${meetingError.message}`);
      }

      // Fetch attendees separately for better control
      const { data: attendeesData, error: attendeesError } = await supabase
        .from('meeting_attendees')
        .select(`
          person_id,
          role_in_meeting,
          attendance_status,
          people (
            first_name,
            last_name,
            email,
            role_title,
            departments (
              department_name
            )
          )
        `)
        .eq('meeting_id', meetingId);

      if (attendeesError) {
        throw new Error(`Error fetching attendees: ${attendeesError.message}`);
      }

      // Transform attendees data
      const attendees: Attendee[] = (attendeesData || []).map((item: any) => ({
        person_id: item.person_id,
        first_name: item.people?.first_name || 'Unknown',
        last_name: item.people?.last_name || '',
        role_in_meeting: item.role_in_meeting,
        attendance_status: item.attendance_status,
        email: item.people?.email || null,
        role_title: item.people?.role_title || null,
        department_name: item.people?.departments?.department_name || 'Unknown',
      }));

      return {
        meeting: meetingData,
        attendees,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!meetingId && meetingId > 0,
  });
};

type TabType = 'details' | 'agenda' | 'notes' | 'attendees';

const MeetingPageContainer: React.FC<MeetingPageContainerProps> = ({ meetingId }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data, isLoading, error } = useMeetingDetail(meetingId);
  
  // Get permissions based on meeting status
  const permissions = useMeetingPermissions(data?.meeting?.status || 'not_scheduled');

  const handleMeetingUpdate = async (updates: Partial<DetailedMeeting>) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('meeting_id', meetingId);

      if (error) throw error;

      // Invalidate and refetch the meeting data
      await queryClient.invalidateQueries({ queryKey: ['meeting-detail', meetingId] });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to update meeting:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Meeting Not Found</h1>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Unable to load meeting details.'}
          </p>
        </div>
      </div>
    );
  }

  const { meeting, attendees } = data;

  const tabs = [
    { id: 'details' as TabType, label: 'Details', icon: '📝' },
    { id: 'agenda' as TabType, label: 'Agenda', icon: '📋' },
    { id: 'notes' as TabType, label: 'Notes', icon: '📄' },
    { id: 'attendees' as TabType, label: 'Attendees', icon: '👥' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <MeetingHeader
        meeting={meeting}
        onMeetingUpdate={handleMeetingUpdate}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <MeetingStatusCard
        meeting={meeting}
        attendees={attendees}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{tab.icon}</span>
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Permission Warning Banner */}
        {permissions.restrictionReason && !permissions.canEditMeetingDetails && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              <p className="text-sm text-amber-800">
                <strong>Limited Editing:</strong> {permissions.restrictionReason}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Meeting Details</h3>
              {permissions.canEditMeetingDetails && (
                <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Edit Details
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Basic Information</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Meeting Type</dt>
                    <dd className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{meeting.meeting_types.type_name}</span>
                      {permissions.canEditMeetingType && (
                        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          Change
                        </button>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Phase</dt>
                    <dd className="text-sm text-gray-900">
                      {meeting.phases.phase_number}. {meeting.phases.phase_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Initiative</dt>
                    <dd className="text-sm text-gray-900">
                      {meeting.initiatives?.initiative_name || 'None'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Duration</dt>
                    <dd className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{meeting.duration_minutes} minutes</span>
                      {permissions.canEditSchedule && (
                        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          Edit
                        </button>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Location</dt>
                    <dd className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{meeting.location_platform || 'Not specified'}</span>
                      {permissions.canEditSchedule && (
                        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                          Edit
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Objectives & Messages</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-500">Meeting Objectives</dt>
                    <dd className="flex items-start justify-between">
                      <span className="text-sm text-gray-900 flex-1">{meeting.meeting_objectives || 'None specified'}</span>
                      {permissions.canEditMeetingDetails && (
                        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2">
                          Edit
                        </button>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Key Messages</dt>
                    <dd className="flex items-start justify-between">
                      <span className="text-sm text-gray-900 flex-1">{meeting.key_messages || 'None specified'}</span>
                      {permissions.canEditMeetingDetails && (
                        <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2">
                          Edit
                        </button>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Meeting Agenda</h3>
              {permissions.canEditTemplate && (
                <div className="flex items-center gap-2">
                  {!permissions.canEditTemplateStructure && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Content only
                    </span>
                  )}
                  <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    {permissions.canEditTemplateStructure ? 'Edit Agenda' : 'Edit Content'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-gray-600">
              <p>Agenda editing interface will be implemented in Phase 2.</p>
              
              {!permissions.canEditTemplate && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    📋 <strong>Read-only:</strong> Agenda cannot be modified while the meeting is {meeting.status.replace('_', ' ')}.
                  </p>
                </div>
              )}
              
              {meeting.template_data && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Template</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                    {JSON.stringify(meeting.template_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Meeting Notes</h3>
              {(permissions.canTakeNotes || permissions.canEditNotes) && (
                <div className="flex items-center gap-2">
                  {permissions.canTakeNotes && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Live notes
                    </span>
                  )}
                  <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                    {permissions.canTakeNotes ? 'Take Notes' : 'Edit Notes'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="text-gray-600">
              <p>Notes management interface will be implemented in Phase 3.</p>
              
              {!permissions.canTakeNotes && !permissions.canEditNotes && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    📝 <strong>Read-only:</strong> Notes cannot be modified for {meeting.status.replace('_', ' ')} meetings.
                  </p>
                </div>
              )}
              
              {permissions.canTakeNotes && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    🟢 <strong>Live Meeting:</strong> You can take notes in real-time during this meeting.
                  </p>
                </div>
              )}
              
              {meeting.structured_notes && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Structured Notes</h4>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                    {JSON.stringify(meeting.structured_notes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Meeting Attendees</h3>
              {permissions.canEditAttendees && (
                <button className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                  Manage Attendees
                </button>
              )}
            </div>
            
            {!permissions.canEditAttendees && meeting.status === 'in-progress' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  👥 <strong>Attendance Tracking:</strong> You can update attendance status during the meeting.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendees.map((attendee) => (
                <div key={attendee.person_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {attendee.first_name.charAt(0)}{attendee.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {attendee.first_name} {attendee.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {attendee.role_title} • {attendee.department_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 capitalize">
                      {attendee.role_in_meeting}
                    </div>
                    {meeting.status === 'in-progress' ? (
                      <select
                        value={attendee.attendance_status}
                        onChange={(e) => console.log('Update attendance:', attendee.person_id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border ${
                          attendee.attendance_status === 'accepted' || attendee.attendance_status === 'present' ? 'bg-green-100 text-green-800 border-green-300' :
                          attendee.attendance_status === 'declined' || attendee.attendance_status === 'absent' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
                    ) : (
                      <div className={`text-xs px-2 py-1 rounded ${
                        attendee.attendance_status === 'accepted' ? 'bg-green-100 text-green-800' :
                        attendee.attendance_status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {attendee.attendance_status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingPageContainer;