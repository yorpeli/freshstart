import { useState, useCallback } from 'react';
import type { Meeting } from '../../../../hooks/useMeetings';

export interface UseQuickMeetingModalReturn {
  isOpen: boolean;
  selectedMeeting: Meeting | null;
  openModal: (meeting: Meeting) => void;
  closeModal: () => void;
  handleEditTime: (meetingId: number, newDate: Date, newDuration: number) => void;
  handleChangeStatus: (meetingId: number, newStatus: string) => void;
  handleViewFullDetails: (meetingId: number) => void;
}

export const useQuickMeetingModal = (
  onEditTime?: (meetingId: number, newDate: Date, newDuration: number) => void,
  onChangeStatus?: (meetingId: number, newStatus: string) => void,
  onViewFullDetails?: (meetingId: number) => void
): UseQuickMeetingModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const openModal = useCallback((meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedMeeting(null);
  }, []);

  const handleEditTime = useCallback((meetingId: number, newDate: Date, newDuration: number) => {
    if (onEditTime) {
      onEditTime(meetingId, newDate, newDuration);
    }
    closeModal();
  }, [onEditTime, closeModal]);

  const handleChangeStatus = useCallback((meetingId: number, newStatus: string) => {
    if (onChangeStatus) {
      onChangeStatus(meetingId, newStatus);
    }
    closeModal();
  }, [onChangeStatus, closeModal]);

  const handleViewFullDetails = useCallback((meetingId: number) => {
    if (onViewFullDetails) {
      onViewFullDetails(meetingId);
    }
    closeModal();
  }, [onViewFullDetails, closeModal]);

  return {
    isOpen,
    selectedMeeting,
    openModal,
    closeModal,
    handleEditTime,
    handleChangeStatus,
    handleViewFullDetails,
  };
};
