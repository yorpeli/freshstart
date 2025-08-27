import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { QuickMeetingHeaderProps } from '../types';

const QuickMeetingHeader: React.FC<QuickMeetingHeaderProps> = ({ 
  meeting, 
  onClose,
  isEditing,
  editForm,
  onEditFormChange
}) => {
  const meetingDate = parseISO(meeting.scheduled_date);
  const startTime = format(meetingDate, 'HH:mm');
  const endTime = format(
    new Date(meetingDate.getTime() + meeting.duration_minutes * 60000),
    'HH:mm'
  );

  // Helper function to extract time from ISO string for HTML time input
  const extractTimeFromISO = (isoString: string): string => {
    try {
      const date = parseISO(isoString);
      return format(date, 'HH:mm');
    } catch (error) {
      console.warn('Failed to parse ISO string:', isoString);
      return '09:00'; // fallback time
    }
  };

  // Helper function to create ISO string from date and time
  const createISOFromDateAndTime = (dateStr: string, timeStr: string): string => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(dateStr);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    } catch (error) {
      console.warn('Failed to create ISO string from date and time:', dateStr, timeStr);
      return meeting.scheduled_date; // fallback to original
    }
  };

  const getDurationOptions = () => [15, 30, 45, 60, 90, 120];

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
          {isEditing ? (
            <input
              type="text"
              value={editForm.meeting_name}
              onChange={(e) => onEditFormChange('meeting_name', e.target.value)}
              className="w-full text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none"
              placeholder="Meeting name"
            />
          ) : (
            meeting.meeting_name
          )}
        </h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="date"
                  value={editForm.scheduled_date.split('T')[0]}
                  onChange={(e) => {
                    const currentTime = extractTimeFromISO(editForm.scheduled_date);
                    const newISO = createISOFromDateAndTime(e.target.value, currentTime);
                    onEditFormChange('scheduled_date', newISO);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <span>{format(meetingDate, 'EEE, MMM d, yyyy')}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="time"
                  value={extractTimeFromISO(editForm.scheduled_date)}
                  onChange={(e) => {
                    const currentDate = editForm.scheduled_date.split('T')[0];
                    const newISO = createISOFromDateAndTime(currentDate, e.target.value);
                    onEditFormChange('scheduled_date', newISO);
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span>-</span>
                <span>
                  {format(
                    new Date(`2000-01-01T${extractTimeFromISO(editForm.scheduled_date)}`).getTime() + editForm.duration_minutes * 60000, 
                    'HH:mm'
                  )}
                </span>
                <span className="text-gray-500">({editForm.duration_minutes} min)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span>{startTime} - {endTime}</span>
                <span className="text-gray-500">({meeting.duration_minutes} min)</span>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">Duration:</span>
              <select
                value={editForm.duration_minutes}
                onChange={(e) => onEditFormChange('duration_minutes', Number(e.target.value))}
                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getDurationOptions().map(duration => (
                  <option key={duration} value={duration}>
                    {duration} min
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickMeetingHeader;
