import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import TimeBlockedSchedule from './TimeBlockedSchedule';
import { QuickMeetingModal } from '../meetings/QuickMeetingModal';
import type { Meeting } from '../meetings/hooks/useMeetings';
import type { MeetingEditForm } from '../meetings/QuickMeetingModal/types';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

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

  // Handle saving meeting changes
  const handleSave = async (meetingId: number, updatedData: Partial<MeetingEditForm>) => {
    try {
      // Update basic meeting fields
      const meetingUpdateData: any = {};
      
      if (updatedData.meeting_name !== undefined) {
        meetingUpdateData.meeting_name = updatedData.meeting_name;
      }
      if (updatedData.scheduled_date !== undefined) {
        meetingUpdateData.scheduled_date = updatedData.scheduled_date;
      }
      if (updatedData.duration_minutes !== undefined) {
        meetingUpdateData.duration_minutes = updatedData.duration_minutes;
      }
      if (updatedData.status !== undefined) {
        meetingUpdateData.status = updatedData.status;
      }
      if (updatedData.location_platform !== undefined) {
        meetingUpdateData.location_platform = updatedData.location_platform;
      }

      // Update meeting if there are basic fields to update
      if (Object.keys(meetingUpdateData).length > 0) {
        const { error: meetingError } = await supabase
          .from('meetings')
          .update(meetingUpdateData)
          .eq('meeting_id', meetingId);

        if (meetingError) {
          console.error('Error updating meeting:', meetingError);
          throw meetingError;
        }
      }

      // Update initiative if it changed
      if (updatedData.initiative_name !== undefined) {
        let initiativeId = null;
        if (updatedData.initiative_name) {
          // Find the initiative by name
          const { data: initiatives } = await supabase
            .from('initiatives')
            .select('initiative_id')
            .eq('initiative_name', updatedData.initiative_name)
            .single();
          
          if (initiatives) {
            initiativeId = initiatives.initiative_id;
          }
        }

        const { error: initiativeError } = await supabase
          .from('meetings')
          .update({ initiative_id: initiativeId })
          .eq('meeting_id', meetingId);

        if (initiativeError) {
          console.error('Error updating meeting initiative:', initiativeError);
          throw initiativeError;
        }
      }

      // Update workstreams if they changed
      if (updatedData.workstream_ids !== undefined) {
        // First, delete existing workstream relationships
        const { error: deleteError } = await supabase
          .from('meeting_workstreams')
          .delete()
          .eq('meeting_id', meetingId);

        if (deleteError) {
          console.error('Error deleting existing workstreams:', deleteError);
          throw deleteError;
        }

        // Then, insert new workstream relationships
        if (updatedData.workstream_ids.length > 0) {
          const workstreamRelations = updatedData.workstream_ids.map(workstreamId => ({
            meeting_id: meetingId,
            workstream_id: workstreamId
          }));

          const { error: insertError } = await supabase
            .from('meeting_workstreams')
            .insert(workstreamRelations);

          if (insertError) {
            console.error('Error inserting new workstreams:', insertError);
            throw insertError;
          }
        }
      }

      console.log('Meeting updated successfully:', { meetingId, updatedData });
      
      // Invalidate and refetch meetings data to update the UI
      await queryClient.invalidateQueries({ queryKey: ['meetings'] });
    } catch (error) {
      console.error('Failed to update meeting:', error);
      alert('Failed to update meeting. Please try again.');
    }
  };

  // Modal handlers
  const openModal = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedMeeting(null);
    setIsOpen(false);
  };

  const handleViewFullDetails = (meetingId: number) => {
    console.log('Navigating to meeting details:', meetingId);
    navigate(`/meetings/${meetingId}`);
  };

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
        onSave={handleSave}
        onViewFullDetails={handleViewFullDetails}
      />
    </>
  );
};

export default TimeBlockedScheduleWithQuickModal;
