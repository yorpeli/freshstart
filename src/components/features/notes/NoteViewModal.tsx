import React from 'react';
import type { NoteWithRelationships } from '../../../lib/types';
import { Modal } from '../../ui';
import { Badge } from '../../ui';
import { MarkdownRenderer } from './';
import { formatDistanceToNow } from 'date-fns';
import { X, Calendar, User, Tag } from 'lucide-react';

interface NoteViewModalProps {
  note: NoteWithRelationships | null;
  isOpen: boolean;
  onClose: () => void;
}

const NoteViewModal: React.FC<NoteViewModalProps> = ({ note, isOpen, onClose }) => {
  if (!note) return null;

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderConnectedEntities = () => {
    const entities = [];
    
    if (note.connected_phases?.length) {
      entities.push(
        <div key="phases" className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Connected Phases</h4>
          <div className="flex flex-wrap gap-2">
            {note.connected_phases.map((phase) => (
              <Badge key={phase.phase_id} variant="default">
                {phase.phase_name}
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    if (note.connected_meetings?.length) {
      entities.push(
        <div key="meetings" className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Connected Meetings</h4>
          <div className="flex flex-wrap gap-2">
            {note.connected_meetings.map((meeting) => (
              <Badge key={meeting.meeting_id} variant="default">
                {meeting.meeting_name}
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    if (note.connected_initiatives?.length) {
      entities.push(
        <div key="initiatives" className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Connected Initiatives</h4>
          <div className="flex flex-wrap gap-2">
            {note.connected_initiatives.map((initiative) => (
              <Badge key={initiative.initiative_id} variant="default">
                {initiative.initiative_name}
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    if (note.connected_workstreams?.length) {
      entities.push(
        <div key="workstreams" className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Connected Workstreams</h4>
          <div className="flex flex-wrap gap-2">
            {note.connected_workstreams.map((workstream) => (
              <Badge key={workstream.workstream_id} variant="default">
                {workstream.workstream_name}
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    return entities;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={note.header} size="lg">
      <div className="p-6">
        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>Created by {note.created_by}</span>
          </div>
        </div>

        {/* Importance Badge */}
        <div className="mb-6">
          <Badge className={getImportanceColor(note.importance)}>
            {note.importance} Priority
          </Badge>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Content</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <MarkdownRenderer content={note.body} />
          </div>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Connected Entities */}
        {renderConnectedEntities().length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Connections</h3>
            <div className="space-y-4">
              {renderConnectedEntities()}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NoteViewModal;
