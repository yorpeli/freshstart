import type { Meeting } from '../../../hooks/useMeetings';

export interface QuickMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onSave?: (meetingId: number, updatedData: Partial<MeetingEditForm>) => void;
  onViewFullDetails?: (meetingId: number) => void;
  onDownloadICS?: (meetingId: number) => void;
  className?: string;
}

export interface MeetingEditForm {
  meeting_name: string;
  scheduled_date: string;
  duration_minutes: number;
  status: string;
  location_platform: string;
  phase_name: string;
  initiative_name: string | null;
  workstream_ids: number[];
}

export interface QuickMeetingHeaderProps {
  meeting: Meeting;
  onClose: () => void;
  isEditing: boolean;
  editForm: MeetingEditForm;
  onEditFormChange: (field: keyof MeetingEditForm, value: any) => void;
}

export interface QuickMeetingAttendeesProps {
  attendees: string[];
  className?: string;
}

export interface QuickMeetingContextProps {
  meeting: Meeting;
  className?: string;
  isEditing: boolean;
  editForm: MeetingEditForm;
  onEditFormChange: (field: keyof MeetingEditForm, value: any) => void;
}

export interface QuickMeetingActionsProps {
  meeting: Meeting;
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  onViewFullDetails?: (meetingId: number) => void;
  onDownloadICS?: (meetingId: number) => void;
  className?: string;
}
