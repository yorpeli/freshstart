import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface MeetingRowProps {
  meeting: {
    name: string;
    type: string;
    date: string;
    duration: number;
    location: string;
    status: string;
    attendees: string[];
  };
}

const MeetingRow: React.FC<MeetingRowProps> = ({ meeting }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {meeting.name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{meeting.type}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Calendar className="mr-2 h-4 w-4 text-gray-400" />
          {formatDate(meeting.date)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Clock className="mr-2 h-4 w-4 text-gray-400" />
          {meeting.duration} min
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <MapPin className="mr-2 h-4 w-4 text-gray-400" />
          {meeting.location}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
          {meeting.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center text-sm text-gray-900">
          <Users className="mr-2 h-4 w-4 text-gray-400" />
          {meeting.attendees.join(', ')}
        </div>
      </td>
    </tr>
  );
};

export default MeetingRow;
