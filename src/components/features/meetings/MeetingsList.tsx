import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import MeetingDetailModal from './MeetingDetailModal/MeetingDetailModal';


const MeetingsList: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [meetingTypes, setMeetingTypes] = useState<any[]>([]);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchMeetings(),
          fetchMeetingTypes(),
          fetchAttendees()
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
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
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

  const fetchAttendees = async () => {
    try {
      // First try the full query with joins
      const { data, error } = await supabase
        .from('meeting_attendees')
        .select(`
          meeting_id,
          person_id,
          role_in_meeting,
          people (
            first_name,
            last_name,
            email
          )
        `);

      if (error) {
        // If the complex query fails, try a simpler one
        console.warn('Complex attendee query failed, trying simple query:', error.message);
        
        const { data: simpleData, error: simpleError } = await supabase
          .from('meeting_attendees')
          .select('meeting_id, person_id, role_in_meeting');

        if (simpleError) {
          console.warn('Could not fetch attendees:', simpleError.message);
          setAttendees([]);
          return;
        }
        
        setAttendees(simpleData || []);
        return;
      }
      
      setAttendees(data || []);
    } catch (err) {
      console.warn('Failed to fetch attendees:', err);
      setAttendees([]);
    }
  };

  const getMeetingTypeName = (meetingTypeId: number) => {
    const meetingType = meetingTypes.find(type => type.meeting_type_id === meetingTypeId);
    return meetingType ? meetingType.type_name : 'Unknown';
  };

  const getMeetingAttendees = (meetingId: number) => {
    const meetingAttendees = attendees.filter(attendee => attendee.meeting_id === meetingId);
    return meetingAttendees.map(attendee => {
      // Handle both full and simplified attendee structures
      if (attendee.people) {
        // Full structure with people join
        return {
          name: `${attendee.people.first_name || 'Unknown'} ${attendee.people.last_name || ''}`,
          role: attendee.role_in_meeting || 'unknown',
          email: attendee.people.email || 'No email'
        };
      } else {
        // Simplified structure without people join
        return {
          name: `Person ${attendee.person_id}`,
          role: attendee.role_in_meeting || 'unknown',
          email: 'No email'
        };
      }
    });
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
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Scheduled Meetings ({meetings.length})
        </h3>
      </div>
      
      {meetings.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No meetings scheduled yet. Create your first meeting to get started!
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meetings.map((meeting) => (
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
                      {getMeetingTypeName(meeting.meeting_type_id)}
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
                      const meetingAttendees = getMeetingAttendees(meeting.meeting_id);
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
                    <button
                      onClick={() => handleViewDetails(meeting.meeting_id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
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
   );
 };

export default MeetingsList;
