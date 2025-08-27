import React, { useState, useEffect } from 'react';
import { Edit, Save, XCircle, X } from 'lucide-react';
import type { QuickMeetingModalProps, MeetingEditForm } from './types';
import QuickMeetingHeader from './components/QuickMeetingHeader';
import QuickMeetingAttendees from './components/QuickMeetingAttendees';
import QuickMeetingContext from './components/QuickMeetingContext';
import QuickMeetingActions from './components/QuickMeetingActions';

const QuickMeetingModal: React.FC<QuickMeetingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onSave,
  onViewFullDetails,
  onDownloadICS,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<MeetingEditForm>(() => ({
    meeting_name: meeting?.meeting_name || '',
    scheduled_date: meeting?.scheduled_date || '',
    duration_minutes: meeting?.duration_minutes || 30,
    status: meeting?.status || 'not_scheduled',
    location_platform: meeting?.location_platform || '',
    phase_name: meeting?.phase_name || '',
    initiative_name: meeting?.initiative_name || null,
    workstream_ids: meeting?.workstreams?.map((w: { workstream_id: number }) => w.workstream_id) || []
  }));

  // Reset form when meeting changes
  useEffect(() => {
    if (meeting) {
      setEditForm({
        meeting_name: meeting.meeting_name,
        scheduled_date: meeting.scheduled_date,
        duration_minutes: meeting.duration_minutes,
        status: meeting.status,
        location_platform: meeting.location_platform,
        phase_name: meeting.phase_name,
        initiative_name: meeting.initiative_name,
        workstream_ids: meeting.workstreams?.map((w: { workstream_id: number }) => w.workstream_id) || []
      });
      setIsEditing(false);
    }
  }, [meeting]);

  const handleEditFormChange = (field: keyof MeetingEditForm, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave && meeting) {
      onSave(meeting.meeting_id, editForm);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form to original values
    if (meeting) {
      setEditForm({
        meeting_name: meeting.meeting_name,
        scheduled_date: meeting.scheduled_date,
        duration_minutes: meeting.duration_minutes,
        status: meeting.status,
        location_platform: meeting.location_platform,
        phase_name: meeting.phase_name,
        initiative_name: meeting.initiative_name,
        workstream_ids: meeting.workstreams?.map((w: { workstream_id: number }) => w.workstream_id) || []
      });
    }
    setIsEditing(false);
  };

  const handleDownloadICS = async (meetingId: number) => {
    try {
      // Get the Supabase URL and anon key from the environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kesfmdnzvlcmlqofhyjp.supabase.co';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlc2ZtZG56dmxjbWxxb2ZoeWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTk3MTgsImV4cCI6MjA3MDY5NTcxOH0.7mr_leHTmSt24ILUFfLxgjfBlkcOMC4o40L-6UL5m3Y';
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/ics-generator?meeting_id=${meetingId}`;
      
      console.log('Calling ICS edge function:', edgeFunctionUrl);
      console.log('Using anon key:', supabaseAnonKey.substring(0, 20) + '...');
      
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Call the ICS generator edge function
      const response = await fetch(edgeFunctionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Failed to generate ICS: ${response.status} ${response.statusText}`);
      }

      // Get the ICS content
      const icsContent = await response.text();
      console.log('ICS content received:', icsContent.substring(0, 200) + '...');
      
      // Create a blob and download the file
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meeting-${meetingId}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('ICS file downloaded successfully');
    } catch (error: unknown) {
      console.error('Error downloading ICS:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Download timed out. The request took too long to complete.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Failed to download ICS file: ${errorMessage}. Please try again.`);
      }
    }
  };

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-4 sm:p-6">
          {/* Header with edit/save/cancel buttons */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isEditing ? 'Edit Meeting' : 'Meeting Details'}
              </h3>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-2 hover:bg-green-100 rounded-full transition-colors text-green-600"
                    title="Save changes"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-600"
                    title="Cancel editing"
                  >
                    <XCircle size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-blue-100 rounded-full transition-colors text-blue-600"
                  title="Edit meeting"
                >
                  <Edit size={20} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Header with meeting name, time, duration */}
          <QuickMeetingHeader 
            meeting={meeting} 
            onClose={onClose}
            isEditing={isEditing}
            editForm={editForm}
            onEditFormChange={handleEditFormChange}
          />
          
          {/* Meeting context: status, location, phase, initiative, workstreams */}
          <QuickMeetingContext 
            meeting={meeting} 
            className="mb-6"
            isEditing={isEditing}
            editForm={editForm}
            onEditFormChange={handleEditFormChange}
          />
          
          {/* Attendees list */}
          <QuickMeetingAttendees attendees={meeting.attendees} className="mb-6" />
          
          {/* Quick actions: save/cancel when editing, or view details/download ICS when viewing */}
          <QuickMeetingActions
            meeting={meeting}
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
            onViewFullDetails={onViewFullDetails}
            onDownloadICS={handleDownloadICS}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickMeetingModal;
