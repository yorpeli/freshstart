import React from 'react';
import { Users } from 'lucide-react';
import type { QuickMeetingAttendeesProps } from '../index';

const QuickMeetingAttendees: React.FC<QuickMeetingAttendeesProps> = ({ attendees, className = '' }) => {
  if (!attendees || attendees.length === 0) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-gray-500 ${className}`}>
        <Users className="h-4 w-4" />
        <span>No attendees</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <Users className="h-4 w-4" />
        <span>Attendees ({attendees.length})</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {attendees.map((attendee, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {attendee}
          </span>
        ))}
      </div>
    </div>
  );
};

export default QuickMeetingAttendees;
