import React from 'react';
import { Clock, Calendar, CheckCircle, AlertCircle, XCircle, Play, Users } from 'lucide-react';

interface Meeting {
  meeting_id: number;
  status: string;
  scheduled_date: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

interface Attendee {
  person_id: number;
  attendance_status: string;
}

interface MeetingStatusCardProps {
  meeting: Meeting;
  attendees: Attendee[];
  className?: string;
}

const MeetingStatusCard: React.FC<MeetingStatusCardProps> = ({
  meeting,
  attendees,
  className = ''
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_scheduled':
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          label: 'Not Scheduled',
          description: 'Meeting needs to be scheduled'
        };
      case 'scheduled':
        return {
          icon: Calendar,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          label: 'Scheduled',
          description: 'Meeting is scheduled and ready'
        };
      case 'in-progress':
        return {
          icon: Play,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          label: 'In Progress',
          description: 'Meeting is currently active'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-300',
          label: 'Completed',
          description: 'Meeting has been completed'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          label: 'Cancelled',
          description: 'Meeting has been cancelled'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          label: status,
          description: 'Unknown status'
        };
    }
  };

  const getTimeUntilMeeting = () => {
    if (!meeting.scheduled_date) return null;
    
    const now = new Date();
    const meetingDate = new Date(meeting.scheduled_date);
    const diffMs = meetingDate.getTime() - now.getTime();
    
    if (diffMs < 0) {
      // Meeting has passed
      const pastMs = Math.abs(diffMs);
      const pastHours = Math.floor(pastMs / (1000 * 60 * 60));
      const pastDays = Math.floor(pastHours / 24);
      
      if (pastDays > 0) {
        return `${pastDays} day${pastDays > 1 ? 's' : ''} ago`;
      } else if (pastHours > 0) {
        return `${pastHours} hour${pastHours > 1 ? 's' : ''} ago`;
      } else {
        const pastMinutes = Math.floor(pastMs / (1000 * 60));
        return `${pastMinutes} minute${pastMinutes > 1 ? 's' : ''} ago`;
      }
    } else {
      // Meeting is in the future
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `in ${days} day${days > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        return `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        const minutes = Math.floor(diffMs / (1000 * 60));
        return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
      }
    }
  };

  const getAttendeeStats = () => {
    const total = attendees.length;
    const accepted = attendees.filter(a => a.attendance_status === 'accepted').length;
    const declined = attendees.filter(a => a.attendance_status === 'declined').length;
    const pending = total - accepted - declined;
    
    return { total, accepted, declined, pending };
  };

  const getProgressInfo = () => {
    const now = new Date();
    const created = new Date(meeting.created_at);
    const updated = new Date(meeting.updated_at);
    
    // Calculate time since creation
    const timeSinceCreation = now.getTime() - created.getTime();
    const daysSinceCreation = Math.floor(timeSinceCreation / (1000 * 60 * 60 * 24));
    
    // Calculate time since last update
    const timeSinceUpdate = now.getTime() - updated.getTime();
    const hoursSinceUpdate = Math.floor(timeSinceUpdate / (1000 * 60 * 60));
    
    return { daysSinceCreation, hoursSinceUpdate };
  };

  const statusInfo = getStatusInfo(meeting.status);
  const StatusIcon = statusInfo.icon;
  const timeUntil = getTimeUntilMeeting();
  const attendeeStats = getAttendeeStats();
  const progressInfo = getProgressInfo();

  return (
    <div className={`bg-white border rounded-lg p-6 transition-all duration-300 ease-in-out ${statusInfo.borderColor} ${className}`}>
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg transition-all duration-300 ease-in-out ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-5 w-5 transition-all duration-300 ease-in-out ${statusInfo.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{statusInfo.label}</h3>
            <p className="text-sm text-gray-600">{statusInfo.description}</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{meeting.duration_minutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{attendeeStats.total}</span>
          </div>
        </div>
      </div>

      {/* Status-Specific Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timing Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Timing</h4>
          {meeting.status === 'not_scheduled' ? (
            <p className="text-sm text-gray-600">No scheduled date yet</p>
          ) : (
            <>
              {timeUntil && (
                <p className="text-sm text-gray-900 font-medium">{timeUntil}</p>
              )}
              <p className="text-xs text-gray-500">
                {new Date(meeting.scheduled_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </>
          )}
        </div>

        {/* Attendee Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attendees</h4>
          {attendeeStats.total === 0 ? (
            <p className="text-sm text-gray-600">No attendees added</p>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-900">
                {attendeeStats.accepted} of {attendeeStats.total} accepted
              </p>
              {attendeeStats.pending > 0 && (
                <p className="text-xs text-amber-600">
                  {attendeeStats.pending} pending response
                </p>
              )}
              {attendeeStats.declined > 0 && (
                <p className="text-xs text-red-600">
                  {attendeeStats.declined} declined
                </p>
              )}
            </div>
          )}
        </div>

        {/* Progress Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Progress</h4>
          <div className="space-y-1">
            <p className="text-sm text-gray-900">
              Created {progressInfo.daysSinceCreation} day{progressInfo.daysSinceCreation !== 1 ? 's' : ''} ago
            </p>
            <p className="text-xs text-gray-500">
              {progressInfo.hoursSinceUpdate === 0 
                ? 'Updated recently' 
                : `Updated ${progressInfo.hoursSinceUpdate} hour${progressInfo.hoursSinceUpdate !== 1 ? 's' : ''} ago`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Status-Specific Alerts */}
      {meeting.status === 'not_scheduled' && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            ⚠️ This meeting needs to be scheduled before it can be started.
          </p>
        </div>
      )}

      {meeting.status === 'scheduled' && timeUntil && timeUntil.includes('in') && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            📅 Meeting starts {timeUntil}. All attendees have been notified.
          </p>
        </div>
      )}

      {meeting.status === 'in-progress' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            🟢 Meeting is currently in progress. Notes and attendance are being tracked.
          </p>
        </div>
      )}

      {meeting.status === 'completed' && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
          <p className="text-sm text-purple-800">
            ✅ Meeting completed successfully. Review notes and create action items.
          </p>
        </div>
      )}

      {meeting.status === 'cancelled' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            ❌ This meeting has been cancelled. All attendees have been notified.
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingStatusCard;