import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import MeetingDetailModal from './MeetingDetailModal/MeetingDetailModal';
import MeetingsFilters from './MeetingsFilters';
import { useMeetingsFilters } from './hooks/useMeetingsFilters';
import { SyncToCalendarButton } from './GoogleCalendarSync';
import type { MeetingWithRelations } from './types';


const MeetingsList: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingWithRelations[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [workstreams, setWorkstreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Use the meetings filters hook
  const { filters, filteredMeetings, updateFilters } = useMeetingsFilters(meetings);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchMeetings(),
          fetchMeetingTypes(),
          fetchPhases(),
          fetchWorkstreams()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load meetings data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          meeting_types (
            type_name
          ),
          phases (
            phase_id,
            phase_name,
            phase_number
          ),
          initiatives (
            initiative_id,
            initiative_name
          ),
          meeting_workstreams (
            workstreams (
              workstream_id,
              workstream_name,
              color_code
            )
          ),
          meeting_attendees (
            people (
              first_name,
              last_name
            )
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our MeetingWithRelations interface
      const transformedMeetings = (data || []).map(meeting => ({
        ...meeting,
        meeting_type: meeting.meeting_types,
        phase: meeting.phases,
        initiative: meeting.initiatives,
        workstreams: meeting.meeting_workstreams?.map((mw: any) => mw.workstreams).filter(Boolean) || [],
        attendees: meeting.meeting_attendees?.map((attendee: any) => ({
          name: `${attendee.people?.first_name || ''} ${attendee.people?.last_name || ''}`.trim(),
          role: attendee.role_in_meeting || 'unknown'
        })) || [],
        // Google Calendar fields - will be added after database migration
        google_calendar_event_id: undefined,
        google_calendar_last_sync: undefined
      }));
      
      setMeetings(transformedMeetings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    }
  };

  const fetchMeetingTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_types')
        .select('meeting_type_id, type_name');

      if (error) throw error;
      setMeetingTypes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting types');
    }
  };

  const fetchPhases = async () => {
    try {
      const { data, error } = await supabase
        .from('phases')
        .select('phase_id, phase_name, phase_number')
        .order('phase_number', { ascending: true });

      if (error) throw error;
      setPhases(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch phases');
    }
  };

  const fetchWorkstreams = async () => {
    try {
      const { data, error } = await supabase
        .from('workstreams')
        .select('workstream_id, workstream_name, color_code')
        .order('workstream_name', { ascending: true });

      if (error) throw error;
      setWorkstreams(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workstreams');
    }
  };

  const getMeetingTypeName = (meeting: MeetingWithRelations) => {
    return meeting.meeting_type?.type_name || 'Unknown';
  };

  const getPhaseName = (meeting: MeetingWithRelations) => {
    return meeting.phase ? `${meeting.phase.phase_number}. ${meeting.phase.phase_name}` : 'Unknown';
  };

  const getWorkstreamNames = (meeting: MeetingWithRelations) => {
    if (!meeting.workstreams || meeting.workstreams.length === 0) {
      return 'None';
    }
    return meeting.workstreams.map(w => w.workstream_name).join(', ');
  };

  const handleViewDetails = (meetingId: number) => {
    setSelectedMeetingId(meetingId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMeetingId(null);
  };

  const handleMeetingUpdated = () => {
    // Refresh meetings list when a meeting is updated
    fetchMeetings();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Scheduled Meetings</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Scheduled Meetings</h3>
        </div>
        <div className="p-6">
          <div className="text-red-600 text-center">
            Error loading meetings: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <MeetingsFilters
        filters={filters}
        phases={phases}
        workstreams={workstreams}
        onFiltersChange={updateFilters}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Scheduled Meetings ({filteredMeetings.length} of {meetings.length})
          </h3>
        </div>
        
                {filteredMeetings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {meetings.length === 0 
              ? "No meetings scheduled yet. Create your first meeting to get started!"
              : "No meetings match your current filters. Try adjusting your search criteria."
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Meeting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workstreams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Calendar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMeetings.map((meeting) => {
                // Debug logging for first meeting
                if (meeting.meeting_id === filteredMeetings[0]?.meeting_id) {
                  console.log('First meeting data:', meeting);
                  console.log('Google Calendar fields:', {
                    google_calendar_event_id: meeting.google_calendar_event_id
                  });
                }
                
                return (
                  <tr key={meeting.meeting_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/meetings/${meeting.meeting_id}`)}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors text-left"
                      >
                        {meeting.meeting_name}
                      </button>
                    </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getMeetingTypeName(meeting)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPhaseName(meeting)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getWorkstreamNames(meeting)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {formatDate(meeting.scheduled_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="mr-2 h-4 w-4 text-gray-400" />
                      {meeting.duration_minutes} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                      {meeting.location_platform || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                      const meetingAttendees = meeting.attendees || [];
                      if (meetingAttendees.length === 0) {
                        return <span className="text-gray-400 italic">No attendees</span>;
                      }
                      return meetingAttendees.map((attendee, index) => (
                        <div key={index} className="mb-1 last:mb-0">
                          {attendee.name} ({attendee.role})
                        </div>
                      ));
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(meeting.meeting_id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <SyncToCalendarButton
                        meetingId={meeting.meeting_id}
                        isAlreadySynced={!!meeting.google_calendar_event_id}
                        googleEventId={meeting.google_calendar_event_id}
                        size="sm"
                        variant="icon"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
       
       {/* Meeting Detail Modal */}
       {isDetailModalOpen && selectedMeetingId && (
         <MeetingDetailModal
           isOpen={isDetailModalOpen}
           onClose={handleCloseDetailModal}
           meetingId={selectedMeetingId}
           onMeetingUpdated={handleMeetingUpdated}
         />
       )}
      </div>
    </div>
  );
};

export default MeetingsList;
