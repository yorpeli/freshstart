import React from 'react';
import TimeBlockedSchedule from './TimeBlockedSchedule';
import { QuickMeetingModal, useQuickMeetingModal } from '../meetings/QuickMeetingModal';
import type { Meeting } from '../../../hooks/useMeetings';
import { supabase } from '../../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

interface TimeBlockedScheduleWithQuickModalProps {
  selectedDate: Date;
  viewMode: '1day' | '3days' | 'week';
  viewRange: Date[];
}

const TimeBlockedScheduleWithQuickModal: React.FC<TimeBlockedScheduleWithQuickModalProps> = ({
  selectedDate,
  viewMode,
  viewRange
}) => {
  const queryClient = useQueryClient();

  // Database update functions
  const updateMeeting = async (meetingId: number, updates: Partial<Meeting>) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('meeting_id', meetingId);

      if (error) {
        console.error('Error updating meeting:', error);
        throw error;
      }

      console.log('Meeting updated successfully:', meetingId, updates);
      
      // Invalidate and refetch meetings data to update the UI
      await queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
    } catch (error) {
      console.error('Failed to update meeting:', error);
      // TODO: Show error message to user
      throw error;
    }
  };

  const {
    isOpen,
    selectedMeeting,
    openModal,
    closeModal,
    handleEditTime,
    handleChangeStatus,
    handleViewFullDetails,
  } = useQuickMeetingModal(
    // onEditTime callback
    async (meetingId, newDate, newDuration) => {
      try {
        await updateMeeting(meetingId, { 
          scheduled_date: newDate.toISOString(),
          duration_minutes: newDuration 
        });
        console.log('Meeting time updated:', { meetingId, newDate, newDuration });
      } catch (error) {
        console.error('Failed to update meeting time:', error);
      }
    },
    // onChangeStatus callback
    async (meetingId, newStatus) => {
      try {
        await updateMeeting(meetingId, { status: newStatus });
        console.log('Meeting status updated:', { meetingId, newStatus });
      } catch (error) {
        console.error('Failed to update meeting status:', error);
      }
    },
    // onViewFullDetails callback
    (meetingId) => {
      console.log('View full details for meeting:', meetingId);
      // TODO: Implement navigation to full meeting details
      // navigate(`/meetings/${meetingId}`);
    }
  );

  // Custom click handler for meeting blocks
  const handleMeetingClick = (meeting: Meeting) => {
    console.log('Meeting clicked:', meeting);
    openModal(meeting);
  };

  return (
    <>
      <TimeBlockedSchedule
        selectedDate={selectedDate}
        viewMode={viewMode}
        viewRange={viewRange}
        onMeetingClick={handleMeetingClick}
      />

      <QuickMeetingModal
        isOpen={isOpen}
        onClose={closeModal}
        meeting={selectedMeeting}
        onEditTime={handleEditTime}
        onChangeStatus={handleChangeStatus}
        onViewFullDetails={handleViewFullDetails}
      />
    </>
  );
};

export default TimeBlockedScheduleWithQuickModal;
