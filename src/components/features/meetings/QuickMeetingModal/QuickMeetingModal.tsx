import React from 'react';
import type { QuickMeetingModalProps } from './index';
import QuickMeetingHeader from './components/QuickMeetingHeader';
import QuickMeetingAttendees from './components/QuickMeetingAttendees';
import QuickMeetingContext from './components/QuickMeetingContext';
import QuickMeetingActions from './components/QuickMeetingActions';

const QuickMeetingModal: React.FC<QuickMeetingModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onEditTime,
  onChangeStatus,
  onViewFullDetails,
  onDownloadICS,
  className = ''
}) => {
  if (!isOpen || !meeting) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-4 sm:p-6">
          {/* Header with meeting name, time, duration, and close button */}
          <QuickMeetingHeader meeting={meeting} onClose={onClose} />
          
          {/* Meeting context: status, location, phase, initiative */}
          <QuickMeetingContext meeting={meeting} className="mb-6" />
          
          {/* Attendees list */}
          <QuickMeetingAttendees attendees={meeting.attendees} className="mb-6" />
          
          {/* Quick actions: edit time, change status, download ICS, view full details */}
          <QuickMeetingActions
            meeting={meeting}
            onEditTime={onEditTime}
            onChangeStatus={onChangeStatus}
            onViewFullDetails={onViewFullDetails}
            onDownloadICS={handleDownloadICS}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickMeetingModal;
