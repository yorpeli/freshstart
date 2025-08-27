import React from 'react';
import { MapPin, Tag, Target, Layers } from 'lucide-react';
import type { QuickMeetingContextProps } from '../types';
import { useWorkstreams, useInitiatives } from '../../../../../hooks/useSupabaseQuery';

const QuickMeetingContext: React.FC<QuickMeetingContextProps> = ({ 
  meeting, 
  className = '',
  isEditing,
  editForm,
  onEditFormChange
}) => {
  const { data: workstreams } = useWorkstreams();
  const { data: initiatives } = useInitiatives();

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

  const getStatusOptions = () => [
    'not_scheduled',
    'scheduled', 
    'completed',
    'cancelled'
  ];

  const getCurrentInitiativeName = () => {
    if (!meeting.initiative_name) return 'None';
    return meeting.initiative_name;
  };

  const getCurrentWorkstreamNames = () => {
    if (!meeting.workstreams || meeting.workstreams.length === 0) return 'None';
    return meeting.workstreams.map((w: { workstream_name: string }) => w.workstream_name).join(', ');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Status and Location */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <select
              value={editForm.status}
              onChange={(e) => onEditFormChange('status', e.target.value)}
              className="px-2 py-1 text-xs font-semibold rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getStatusOptions().map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          ) : (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
              {meeting.status.replace('_', ' ')}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <input
              type="text"
              value={editForm.location_platform}
              onChange={(e) => onEditFormChange('location_platform', e.target.value)}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Location/Platform"
            />
          </div>
        ) : (
          meeting.location_platform && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{meeting.location_platform}</span>
            </div>
          )
        )}
      </div>

      {/* Phase, Initiative, and Workstreams */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        {meeting.phase_name && (
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <div className="min-w-0">
              <div className="font-medium text-gray-700">Phase</div>
              <div className="text-gray-600 truncate">{meeting.phase_name}</div>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-gray-500" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-700">Initiative</div>
            {isEditing ? (
              <select
                value={editForm.initiative_name || ''}
                onChange={(e) => onEditFormChange('initiative_name', e.target.value || null)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {initiatives?.map((initiative: { initiative_id: number; initiative_name: string }) => (
                  <option key={initiative.initiative_id} value={initiative.initiative_name}>
                    {initiative.initiative_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-gray-600 truncate">{getCurrentInitiativeName()}</div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Layers className="h-4 w-4 text-gray-500" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-700">Workstreams</div>
            {isEditing ? (
              <div className="space-y-1">
                {workstreams?.map((workstream: { workstream_id: number; workstream_name: string }) => (
                  <label key={workstream.workstream_id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.workstream_ids.includes(workstream.workstream_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onEditFormChange('workstream_ids', [...editForm.workstream_ids, workstream.workstream_id]);
                        } else {
                          onEditFormChange('workstream_ids', editForm.workstream_ids.filter(id => id !== workstream.workstream_id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-xs text-gray-700">{workstream.workstream_name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-gray-600 truncate">{getCurrentWorkstreamNames()}</div>
            )}
          </div>
        </div>
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
