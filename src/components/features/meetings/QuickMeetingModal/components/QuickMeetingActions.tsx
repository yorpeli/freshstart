import React from 'react';
import { Eye, Download, Save, XCircle } from 'lucide-react';
import type { QuickMeetingActionsProps } from '../index';
import { SyncToCalendarButton } from '../../GoogleCalendarSync';

const QuickMeetingActions: React.FC<QuickMeetingActionsProps> = ({
  meeting,
  isEditing,
  onSave,
  onCancel,
  onViewFullDetails,
  onDownloadICS,
  className = ''
}) => {
  const handleViewFullDetails = () => {
    if (onViewFullDetails) {
      onViewFullDetails(meeting.meeting_id);
    }
  };

  const handleDownloadICS = () => {
    if (onDownloadICS) {
      onDownloadICS(meeting.meeting_id);
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center justify-center space-x-4 pt-4 border-t border-gray-200 ${className}`}>
        <button
          onClick={onSave}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col space-y-3 pt-4 border-t border-gray-200 ${className}`}>
        {/* Primary action buttons row */}
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 flex-wrap gap-2">
          {/* Google Calendar Sync Button */}
          <SyncToCalendarButton
            meetingId={meeting.meeting_id}
            isAlreadySynced={!!meeting.google_calendar_event_id}
            googleEventId={meeting.google_calendar_event_id}
            size="sm"
            variant="button"
            className="inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          />

          {/* Download ICS Button */}
          {onDownloadICS && (
            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              ICS
            </button>
          )}
        </div>

        {/* View Full Details Button - centered below */}
        {onViewFullDetails && (
          <div className="flex justify-center">
            <button
              onClick={handleViewFullDetails}
              className="inline-flex items-center px-4 sm:px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Details
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QuickMeetingActions;
