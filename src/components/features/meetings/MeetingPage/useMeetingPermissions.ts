import { useMemo } from 'react';

interface MeetingPermissions {
  canEditTemplate: boolean;
  canEditTemplateStructure: boolean;
  canEditMeetingDetails: boolean;
  canEditMeetingType: boolean;
  canEditAttendees: boolean;
  canEditSchedule: boolean;
  canTakeNotes: boolean;
  canEditNotes: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  canStartMeeting: boolean;
  canCompleteMeeting: boolean;
  canCancelMeeting: boolean;
  canPauseMeeting: boolean;
  restrictionReason?: string;
}

export const useMeetingPermissions = (status: string): MeetingPermissions => {
  return useMemo(() => {
    switch (status) {
      case 'not_scheduled':
        return {
          canEditTemplate: true,
          canEditTemplateStructure: true,
          canEditMeetingDetails: true,
          canEditMeetingType: true,
          canEditAttendees: true,
          canEditSchedule: true,
          canTakeNotes: false,
          canEditNotes: false,
          canChangeStatus: true,
          canDelete: true,
          canStartMeeting: false,
          canCompleteMeeting: false,
          canCancelMeeting: false,
          canPauseMeeting: false,
          restrictionReason: undefined
        };

      case 'scheduled':
        return {
          canEditTemplate: true,
          canEditTemplateStructure: false, // Can edit content but not structure
          canEditMeetingDetails: true,
          canEditMeetingType: true, // With warning
          canEditAttendees: true, // With notification warnings
          canEditSchedule: true, // With notification warnings
          canTakeNotes: false,
          canEditNotes: false,
          canChangeStatus: true,
          canDelete: false,
          canStartMeeting: true,
          canCompleteMeeting: false,
          canCancelMeeting: true,
          canPauseMeeting: false,
          restrictionReason: 'Meeting is scheduled - structural changes may affect attendees'
        };

      case 'in-progress':
        return {
          canEditTemplate: false,
          canEditTemplateStructure: false,
          canEditMeetingDetails: false,
          canEditMeetingType: false,
          canEditAttendees: false, // Can only update attendance status
          canEditSchedule: false,
          canTakeNotes: true,
          canEditNotes: true,
          canChangeStatus: true,
          canDelete: false,
          canStartMeeting: false,
          canCompleteMeeting: true,
          canCancelMeeting: false,
          canPauseMeeting: true,
          restrictionReason: 'Meeting is in progress - focus on taking notes'
        };

      case 'completed':
        return {
          canEditTemplate: false,
          canEditTemplateStructure: false,
          canEditMeetingDetails: false,
          canEditMeetingType: false,
          canEditAttendees: false,
          canEditSchedule: false,
          canTakeNotes: false,
          canEditNotes: true, // Can edit retrospectively
          canChangeStatus: false,
          canDelete: false,
          canStartMeeting: false,
          canCompleteMeeting: false,
          canCancelMeeting: false,
          canPauseMeeting: false,
          restrictionReason: 'Meeting is completed - only notes can be edited'
        };

      case 'cancelled':
        return {
          canEditTemplate: false,
          canEditTemplateStructure: false,
          canEditMeetingDetails: false,
          canEditMeetingType: false,
          canEditAttendees: false,
          canEditSchedule: false,
          canTakeNotes: false,
          canEditNotes: false,
          canChangeStatus: true, // Can reschedule
          canDelete: false,
          canStartMeeting: false,
          canCompleteMeeting: false,
          canCancelMeeting: false,
          canPauseMeeting: false,
          restrictionReason: 'Meeting is cancelled - read-only historical record'
        };

      default:
        return {
          canEditTemplate: false,
          canEditTemplateStructure: false,
          canEditMeetingDetails: false,
          canEditMeetingType: false,
          canEditAttendees: false,
          canEditSchedule: false,
          canTakeNotes: false,
          canEditNotes: false,
          canChangeStatus: false,
          canDelete: false,
          canStartMeeting: false,
          canCompleteMeeting: false,
          canCancelMeeting: false,
          canPauseMeeting: false,
          restrictionReason: 'Unknown status - all actions disabled'
        };
    }
  }, [status]);
};

export default useMeetingPermissions;