import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ArrowLeft, Settings, Play, CheckCircle, Pause, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusChangeDialog from './StatusChangeDialog';

interface Meeting {
  meeting_id: number;
  meeting_name: string;
  scheduled_date: string;
  duration_minutes: number;
  location_platform: string;
  status: string;
  meeting_objectives: string | null;
  key_messages: string | null;
  created_at: string;
  updated_at: string;
  meeting_types: {
    type_name: string;
  };
  phases: {
    phase_name: string;
    phase_number: number;
  };
  initiatives?: {
    initiative_name: string;
  } | null;
}

interface MeetingHeaderProps {
  meeting: Meeting;
  onMeetingUpdate: (updates: any) => Promise<void>;
  hasUnsavedChanges: boolean;
}

const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meeting,
  onMeetingUpdate,
  hasUnsavedChanges
}) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    isOpen: boolean;
    newStatus: string;
  }>({ isOpen: false, newStatus: '' });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in-progress':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_scheduled':
        return 'Not Scheduled';
      case 'scheduled':
        return 'Scheduled';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPrimaryAction = () => {
    switch (meeting.status) {
      case 'not_scheduled':
        return {
          label: 'Schedule Meeting',
          icon: Calendar,
          variant: 'primary' as const,
          action: () => setStatusChangeDialog({ isOpen: true, newStatus: 'scheduled' })
        };
      case 'scheduled':
        return {
          label: 'Start Meeting',
          icon: Play,
          variant: 'success' as const,
          action: () => setStatusChangeDialog({ isOpen: true, newStatus: 'in-progress' })
        };
      case 'in-progress':
        return {
          label: 'Complete Meeting',
          icon: CheckCircle,
          variant: 'primary' as const,
          action: () => setStatusChangeDialog({ isOpen: true, newStatus: 'completed' })
        };
      case 'completed':
        return {
          label: 'Create Action Items',
          icon: Settings,
          variant: 'secondary' as const,
          action: () => console.log('Create action items - Phase 4')
        };
      default:
        return null;
    }
  };

  const getSecondaryActions = () => {
    const actions = [];

    switch (meeting.status) {
      case 'not_scheduled':
        actions.push(
          { 
            label: 'Save Draft', 
            icon: Settings, 
            action: () => console.log('Save draft'),
            tooltip: 'Save current changes as draft'
          },
          { 
            label: 'Delete Meeting', 
            icon: X, 
            action: () => {
              if (window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
                console.log('Delete meeting');
              }
            }, 
            variant: 'danger' as const,
            tooltip: 'Permanently delete this meeting'
          }
        );
        break;
      case 'scheduled':
        actions.push(
          { 
            label: 'Edit Details', 
            icon: Settings, 
            action: () => console.log('Edit details'),
            tooltip: 'Edit meeting details and agenda'
          },
          { 
            label: 'Reschedule', 
            icon: Calendar, 
            action: () => console.log('Reschedule meeting'),
            tooltip: 'Change meeting date and time'
          },
          { 
            label: 'Cancel Meeting', 
            icon: X, 
            action: () => setStatusChangeDialog({ isOpen: true, newStatus: 'cancelled' }), 
            variant: 'danger' as const,
            tooltip: 'Cancel this meeting and notify attendees'
          }
        );
        break;
      case 'in-progress':
        actions.push(
          { 
            label: 'Pause Meeting', 
            icon: Pause, 
            action: () => setStatusChangeDialog({ isOpen: true, newStatus: 'scheduled' }),
            tooltip: 'Pause meeting (can be resumed later)'
          },
          { 
            label: 'Export Notes', 
            icon: Settings, 
            action: () => console.log('Export notes'),
            tooltip: 'Export current meeting notes'
          }
        );
        break;
      case 'completed':
        actions.push(
          { 
            label: 'Export Notes', 
            icon: Settings, 
            action: () => console.log('Export notes'),
            tooltip: 'Export meeting notes and summary'
          },
          { 
            label: 'Edit Notes', 
            icon: Settings, 
            action: () => console.log('Edit notes'),
            tooltip: 'Edit meeting notes and summary'
          },
          { 
            label: 'Duplicate Meeting', 
            icon: Settings, 
            action: () => console.log('Duplicate meeting'),
            tooltip: 'Create a new meeting based on this one'
          }
        );
        break;
      case 'cancelled':
        actions.push(
          { 
            label: 'Reschedule', 
            icon: Calendar, 
            action: () => setStatusChangeDialog({ isOpen: true, newStatus: 'scheduled' }),
            tooltip: 'Reschedule this cancelled meeting'
          },
          { 
            label: 'Duplicate', 
            icon: Settings, 
            action: () => console.log('Duplicate meeting'),
            tooltip: 'Create a new meeting based on this one'
          }
        );
        break;
    }

    return actions;
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onMeetingUpdate({ status: newStatus });
      setStatusChangeDialog({ isOpen: false, newStatus: '' });
    } catch (error) {
      console.error('Failed to update meeting status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChangeConfirm = () => {
    handleStatusChange(statusChangeDialog.newStatus);
  };

  const handleStatusChangeCancel = () => {
    setStatusChangeDialog({ isOpen: false, newStatus: '' });
  };

  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      default:
        return 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300';
    }
  };

  const primaryAction = getPrimaryAction();
  const secondaryActions = getSecondaryActions();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/meetings')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            title="Back to Meetings"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold text-gray-900">{meeting.meeting_name}</h1>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Unsaved changes
                </span>
              )}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all duration-300 ease-in-out ${getStatusColor(meeting.status)}`}>
              {getStatusLabel(meeting.status)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              disabled={isUpdating}
              title={action.tooltip}
              className={`inline-flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${
                action.variant ? getButtonVariant(action.variant) : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}

          {/* Primary Action */}
          {primaryAction && (
            <button
              onClick={primaryAction.action}
              disabled={isUpdating}
              className={`inline-flex items-center gap-2 px-6 py-2 border rounded-md text-sm font-weight transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${getButtonVariant(primaryAction.variant)}`}
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <primaryAction.icon size={16} />
              )}
              {isUpdating ? 'Updating...' : primaryAction.label}
            </button>
          )}
        </div>
      </div>

      {/* Meeting Info Row */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(meeting.scheduled_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{meeting.duration_minutes} minutes</span>
        </div>
        {meeting.location_platform && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{meeting.location_platform}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Type:</span>
          <span>{meeting.meeting_types.type_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Phase:</span>
          <span>{meeting.phases.phase_number}. {meeting.phases.phase_name}</span>
        </div>
        {meeting.initiatives && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Initiative:</span>
            <span>{meeting.initiatives.initiative_name}</span>
          </div>
        )}
      </div>

      {/* Last Updated Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Last updated: {new Date(meeting.updated_at).toLocaleString()}
        </div>
      </div>

      {/* Status Change Dialog */}
      <StatusChangeDialog
        isOpen={statusChangeDialog.isOpen}
        currentStatus={meeting.status}
        newStatus={statusChangeDialog.newStatus}
        meetingName={meeting.meeting_name}
        onConfirm={handleStatusChangeConfirm}
        onCancel={handleStatusChangeCancel}
      />
    </div>
  );
};

export default MeetingHeader;