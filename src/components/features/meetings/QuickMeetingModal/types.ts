import type { Meeting } from '../../../hooks/useMeetings';

export interface QuickMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onEditTime?: (meetingId: number, newDate: Date, newDuration: number) => void;
  onChangeStatus?: (meetingId: number, newStatus: string) => void;
  onViewFullDetails?: (meetingId: number) => void;
  className?: string;
}

export interface QuickMeetingHeaderProps {
  meeting: Meeting;
  onClose: () => void;
}

export interface QuickMeetingAttendeesProps {
  attendees: string[];
  className?: string;
}

export interface QuickMeetingContextProps {
  meeting: Meeting;
  className?: string;
}

export interface QuickMeetingActionsProps {
  meeting: Meeting;
  onEditTime?: (meetingId: number, newDate: Date, newDuration: number) => void;
  onChangeStatus?: (meetingId: number, newStatus: string) => void;
  onViewFullDetails?: (meetingId: number) => void;
  className?: string;
}

export interface TimeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  onSave: (newDate: Date, newDuration: number) => void;
}

export interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
  onSave: (newStatus: string) => void;
}
