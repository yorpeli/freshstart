import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import MeetingHeader from './MeetingHeader';
import MeetingStatusCard from './MeetingStatusCard';
import { useMeetingPermissions } from './useMeetingPermissions';
import { TemplateEditorWithPreview } from '../TemplateEditor';
import NotesManager from './NotesManager';
import AttendeeManager from './AttendeeManager';

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
  role_in_meeting: 'organizer' | 'required' | 'optional';
  attendance_status: 'invited' | 'accepted' | 'declined' | 'present' | 'absent';
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced save function for template changes
  const handleTemplateChange = useCallback((newTemplate: any) => {
    setHasUnsavedChanges(true);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for 7 second delay (fallback)
    saveTimeoutRef.current = setTimeout(() => {
      handleMeetingUpdate({ template_data: newTemplate });
    }, 7000);
  }, [meetingId]);

  // Handler for attendee changes
  const handleAttendeesChange = useCallback((newAttendees: Attendee[]) => {
    // Update local state optimistically
    queryClient.setQueryData(['meeting-detail', meetingId], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        attendees: newAttendees
      };
    });
  }, [meetingId, queryClient]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

      {/* Status Card and Objectives & Messages Section - Always Visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {/* Objectives & Messages - Left side, 50% width */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎯</span>
            <h3 className="text-lg font-medium text-gray-900">Objectives & Messages</h3>
          </div>
          <div className="space-y-3 flex-1 min-h-0">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 hover:bg-blue-100 transition-colors duration-200">
              <h4 className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                Meeting Objectives
              </h4>
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-900 flex-1 leading-tight">
                  {meeting.meeting_objectives || 'None specified'}
                </p>
                {permissions.canEditMeetingDetails && (
                  <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2 flex-shrink-0 transition-all duration-200 hover:bg-blue-100 hover:scale-105 px-2 py-1 rounded font-medium">
                    Edit
                  </button>
                )}
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 hover:bg-green-100 transition-colors duration-200">
              <h4 className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <span className="text-green-600">💬</span>
                Key Messages
              </h4>
              <div className="flex items-start justify-between">
                <p className="text-sm text-gray-900 flex-1 leading-relaxed">
                  {meeting.key_messages || 'None specified'}
                </p>
                {permissions.canEditMeetingDetails && (
                  <button className="text-xs text-green-600 hover:text-green-800 hover:underline ml-2 flex-shrink-0 transition-colors duration-200 hover:bg-green-100 px-2 py-1 rounded">
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Card - Right side, 50% width */}
        <div className="shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
          <MeetingStatusCard
            meeting={meeting}
            attendees={attendees}
            className="flex-1"
          />
        </div>
      </div>

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
            </div>
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-gray-900">Meeting Agenda</h3>
                {hasUnsavedChanges && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></div>
                    Saving...
                  </span>
                )}
              </div>
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
            
            <TemplateEditorWithPreview
              templateData={meeting.template_data || {}}
              onTemplateChange={handleTemplateChange}
              isReadOnly={!permissions.canEditTemplate}
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <NotesManager
            meeting={meeting}
            onNotesUpdate={handleMeetingUpdate}
            canTakeNotes={permissions.canTakeNotes}
            canEditNotes={permissions.canEditNotes}
          />
        )}

        {activeTab === 'attendees' && (
          <AttendeeManager
            attendees={attendees}
            onAttendeesChange={handleAttendeesChange}
            meetingStatus={meeting.status}
            meetingId={meeting.meeting_id}
          />
        )}
      </div>
    </div>
  );
};

export default MeetingPageContainer;