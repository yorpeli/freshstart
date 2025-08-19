import React from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { QuickMeetingHeaderProps } from '../index';

const QuickMeetingHeader: React.FC<QuickMeetingHeaderProps> = ({ meeting, onClose }) => {
  const meetingDate = parseISO(meeting.scheduled_date);
  const startTime = format(meetingDate, 'HH:mm');
  const endTime = format(
    new Date(meetingDate.getTime() + meeting.duration_minutes * 60000),
    'HH:mm'
  );

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
          {meeting.meeting_name}
        </h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{format(meetingDate, 'EEE, MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{startTime} - {endTime}</span>
            <span className="text-gray-500">({meeting.duration_minutes} min)</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="ml-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        aria-label="Close modal"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default QuickMeetingHeader;
