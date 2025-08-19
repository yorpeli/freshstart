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
  className = ''
}) => {
  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto ${className}`}>
        <div className="p-6">
          {/* Header with meeting name, time, duration, and close button */}
          <QuickMeetingHeader meeting={meeting} onClose={onClose} />
          
          {/* Meeting context: status, location, phase, initiative */}
          <QuickMeetingContext meeting={meeting} className="mb-6" />
          
          {/* Attendees list */}
          <QuickMeetingAttendees attendees={meeting.attendees} className="mb-6" />
          
          {/* Quick actions: edit time, change status, view full details */}
          <QuickMeetingActions
            meeting={meeting}
            onEditTime={onEditTime}
            onChangeStatus={onChangeStatus}
            onViewFullDetails={onViewFullDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default QuickMeetingModal;
