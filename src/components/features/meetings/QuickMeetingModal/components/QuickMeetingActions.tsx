import React, { useState } from 'react';
import { Clock, Edit3, Eye, MoreHorizontal, Download } from 'lucide-react';
import type { QuickMeetingActionsProps } from '../index';
import TimeEditModal from './TimeEditModal';
import StatusChangeModal from './StatusChangeModal';

const QuickMeetingActions: React.FC<QuickMeetingActionsProps> = ({
  meeting,
  onEditTime,
  onChangeStatus,
  onViewFullDetails,
  onDownloadICS,
  className = ''
}) => {
  const [showTimeEdit, setShowTimeEdit] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);

  const handleEditTime = (newDate: Date, newDuration: number) => {
    if (onEditTime) {
      onEditTime(meeting.meeting_id, newDate, newDuration);
    }
    setShowTimeEdit(false);
  };

  const handleChangeStatus = (newStatus: string) => {
    if (onChangeStatus) {
      onChangeStatus(meeting.meeting_id, newStatus);
    }
    setShowStatusChange(false);
  };

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

  return (
    <>
      <div className={`flex items-center justify-between pt-4 border-t border-gray-200 ${className}`}>
        <div className="flex items-center space-x-2">
          {/* Edit Time Button */}
          {onEditTime && (
            <button
              onClick={() => setShowTimeEdit(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Clock className="h-4 w-4 mr-2" />
              Edit Time
            </button>
          )}

          {/* Change Status Button */}
          {onChangeStatus && (
            <button
              onClick={() => setShowStatusChange(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Change Status
            </button>
          )}

          {/* Download ICS Button */}
          {onDownloadICS && (
            <button
              onClick={handleDownloadICS}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download ICS
            </button>
          )}
        </div>

        {/* View Full Details Button */}
        {onViewFullDetails && (
          <button
            onClick={handleViewFullDetails}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Full Details
          </button>
        )}
      </div>

      {/* Time Edit Modal */}
      {showTimeEdit && (
        <TimeEditModal
          isOpen={showTimeEdit}
          onClose={() => setShowTimeEdit(false)}
          meeting={meeting}
          onSave={handleEditTime}
        />
      )}

      {/* Status Change Modal */}
      {showStatusChange && (
        <StatusChangeModal
          isOpen={showStatusChange}
          onClose={() => setShowStatusChange(false)}
          meeting={meeting}
          onSave={handleChangeStatus}
        />
      )}
    </>
  );
};

export default QuickMeetingActions;
