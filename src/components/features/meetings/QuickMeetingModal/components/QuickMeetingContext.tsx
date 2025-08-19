import React from 'react';
import { MapPin, Tag, Target } from 'lucide-react';
import type { QuickMeetingContextProps } from '../types';

const QuickMeetingContext: React.FC<QuickMeetingContextProps> = ({ meeting, className = '' }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not_scheduled':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status and Location */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
            {meeting.status}
          </span>
        </div>
        
        {meeting.location_platform && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{meeting.location_platform}</span>
          </div>
        )}
      </div>

      {/* Phase and Initiative */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {meeting.phase_name && (
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <div className="min-w-0">
              <div className="font-medium text-gray-700">Phase</div>
              <div className="text-gray-600 truncate">{meeting.phase_name}</div>
            </div>
          </div>
        )}
        
        {meeting.initiative_name && (
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-gray-500" />
            <div className="min-w-0">
              <div className="font-medium text-gray-700">Initiative</div>
              <div className="text-gray-600 truncate">{meeting.initiative_name}</div>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Type */}
      {meeting.meeting_type && (
        <div className="flex items-center space-x-2 text-sm">
          <div className="font-medium text-gray-700">Type:</div>
          <span className="text-gray-600">{meeting.meeting_type}</span>
        </div>
      )}
    </div>
  );
};

export default QuickMeetingContext;
