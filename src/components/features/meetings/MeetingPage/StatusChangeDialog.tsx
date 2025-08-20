import React from 'react';
import { AlertTriangle, Calendar, Play, CheckCircle, XCircle } from 'lucide-react';

interface StatusChangeDialogProps {
  isOpen: boolean;
  currentStatus: string;
  newStatus: string;
  meetingName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  isOpen,
  currentStatus,
  newStatus,
  meetingName,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_scheduled':
        return { icon: AlertTriangle, color: 'text-gray-600', label: 'Not Scheduled' };
      case 'scheduled':
        return { icon: Calendar, color: 'text-blue-600', label: 'Scheduled' };
      case 'in-progress':
        return { icon: Play, color: 'text-green-600', label: 'In Progress' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-purple-600', label: 'Completed' };
      case 'cancelled':
        return { icon: XCircle, color: 'text-red-600', label: 'Cancelled' };
      default:
        return { icon: AlertTriangle, color: 'text-gray-600', label: status };
    }
  };

  const getTransitionMessage = () => {
    const fromInfo = getStatusInfo(currentStatus);
    const toInfo = getStatusInfo(newStatus);

    switch (`${currentStatus}->${newStatus}`) {
      case 'not_scheduled->scheduled':
        return {
          title: 'Schedule Meeting',
          message: 'This will mark the meeting as scheduled and notify all attendees.',
          consequences: [
            'All attendees will receive calendar invitations',
            'Meeting details will be locked for editing',
            'You can start the meeting when ready'
          ],
          type: 'info' as const
        };

      case 'scheduled->in-progress':
        return {
          title: 'Start Meeting',
          message: 'This will begin the meeting and enable note-taking.',
          consequences: [
            'Meeting agenda and details will be locked',
            'Note-taking interface will be activated',
            'Attendance tracking will begin'
          ],
          type: 'success' as const
        };

      case 'in-progress->completed':
        return {
          title: 'Complete Meeting',
          message: 'This will mark the meeting as completed.',
          consequences: [
            'No further notes can be taken',
            'Final attendance will be recorded',
            'Action items can be created from notes'
          ],
          type: 'info' as const
        };

      case 'in-progress->scheduled':
        return {
          title: 'Pause Meeting',
          message: 'This will pause the meeting and return it to scheduled status.',
          consequences: [
            'Note-taking will be disabled',
            'Meeting can be resumed later',
            'Current notes will be preserved'
          ],
          type: 'warning' as const
        };

      case 'scheduled->cancelled':
        return {
          title: 'Cancel Meeting',
          message: 'This will cancel the meeting and notify all attendees.',
          consequences: [
            'All attendees will be notified of cancellation',
            'Meeting cannot be started',
            'Meeting can be rescheduled later if needed'
          ],
          type: 'danger' as const
        };

      case 'cancelled->scheduled':
        return {
          title: 'Reschedule Meeting',
          message: 'This will reactivate the meeting and return it to scheduled status.',
          consequences: [
            'Meeting will be available to start again',
            'You may want to notify attendees manually',
            'Original meeting details will be restored'
          ],
          type: 'info' as const
        };

      default:
        return {
          title: 'Change Status',
          message: `Change meeting status from ${fromInfo.label} to ${toInfo.label}.`,
          consequences: ['Meeting status will be updated'],
          type: 'info' as const
        };
    }
  };

  const transition = getTransitionMessage();
  const fromInfo = getStatusInfo(currentStatus);
  const toInfo = getStatusInfo(newStatus);
  const FromIcon = fromInfo.icon;
  const ToIcon = toInfo.icon;

  const getTypeStyles = () => {
    switch (transition.type) {
      case 'success':
        return {
          header: 'bg-green-50 border-green-200',
          title: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      case 'warning':
        return {
          header: 'bg-amber-50 border-amber-200',
          title: 'text-amber-800',
          button: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
        };
      case 'danger':
        return {
          header: 'bg-red-50 border-red-200',
          title: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      default:
        return {
          header: 'bg-blue-50 border-blue-200',
          title: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className={`px-6 py-4 border-b rounded-t-lg ${styles.header}`}>
          <h3 className={`text-lg font-semibold ${styles.title}`}>
            {transition.title}
          </h3>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Status Transition Visual */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FromIcon className={`h-5 w-5 ${fromInfo.color}`} />
              <span className="text-sm font-medium text-gray-700">{fromInfo.label}</span>
            </div>
            <div className="text-gray-400">→</div>
            <div className="flex items-center gap-2">
              <ToIcon className={`h-5 w-5 ${toInfo.color}`} />
              <span className="text-sm font-medium text-gray-700">{toInfo.label}</span>
            </div>
          </div>

          {/* Meeting Name */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Meeting:</p>
            <p className="font-medium text-gray-900">{meetingName}</p>
          </div>

          {/* Message */}
          <p className="text-gray-700 mb-4">{transition.message}</p>

          {/* Consequences */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">What will happen:</h4>
            <ul className="space-y-1">
              {transition.consequences.map((consequence, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 ${styles.button}`}
          >
            {transition.title}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeDialog;