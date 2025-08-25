import React from 'react';
import type { NoteWithRelationships } from '../../../lib/types';
import { Card } from '../../ui';
import { Badge } from '../../ui';
import { MarkdownRenderer } from './';
import { formatDistanceToNow } from 'date-fns';

interface NoteCardProps {
  note: NoteWithRelationships;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onView, onEdit, onDelete }) => {
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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    
    // Try to find a good breaking point that doesn't cut markdown links
    const truncated = text.substring(0, maxLength);
    
    // Look for the last complete word or markdown element
    let lastGoodBreak = maxLength;
    
    // Check if we're in the middle of a markdown link
    const linkMatch = truncated.match(/\[([^\]]*)\]\([^)]*$/);
    if (linkMatch) {
      // We're in the middle of a link, try to break before it
      const beforeLink = truncated.lastIndexOf('[', maxLength - 1);
      if (beforeLink > maxLength * 0.7) { // Only break if we're not too far back
        lastGoodBreak = beforeLink;
      }
    }
    
    // Check if we're in the middle of a word
    const lastSpace = truncated.lastIndexOf(' ', lastGoodBreak);
    if (lastSpace > maxLength * 0.8) { // Only break at space if we're not too far back
      lastGoodBreak = lastSpace;
    }
    
    return text.substring(0, lastGoodBreak) + '...';
  };

  // Create a clean preview text that preserves markdown links
  const createContentPreview = (content: string, maxLength: number = 150) => {
    // First, let's try to find a good breaking point
    let preview = truncateText(content, maxLength);
    
    // If the preview ends with a truncated markdown link, try to complete it
    if (preview.endsWith('...') && preview.includes('[') && !preview.includes('](')) {
      // Find the last incomplete link and try to complete it
      const lastBracket = preview.lastIndexOf('[');
      if (lastBracket > maxLength * 0.5) { // Only if we're not too far back
        // Look for the closing bracket and URL in the original content
        const afterBracket = content.substring(lastBracket);
        const linkMatch = afterBracket.match(/^\[([^\]]*)\]\(([^)]+)\)/);
        if (linkMatch) {
          // We can complete this link
          const linkText = linkMatch[1];
          const url = linkMatch[2];
          const completeLink = `[${linkText}](${url})`;
          
          // Check if we can fit the complete link
          const beforeLink = preview.substring(0, lastBracket);
          if (beforeLink.length + completeLink.length <= maxLength) {
            preview = beforeLink + completeLink;
          } else {
            // Can't fit the complete link, break before it
            preview = beforeLink + '...';
          }
        }
      }
    }
    
    return preview;
  };

  const renderConnectedEntities = () => {
    const entities = [];
    
    if (note.connected_phases?.length) {
      entities.push(
        <div key="phases" className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Phases:</span>
          {note.connected_phases.map((phase) => (
            <Badge key={phase.phase_id} variant="default" size="sm">
              {phase.phase_name}
            </Badge>
          ))}
        </div>
      );
    }

    if (note.connected_meetings?.length) {
      entities.push(
        <div key="meetings" className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Meetings:</span>
          {note.connected_meetings.map((meeting) => (
            <Badge key={meeting.meeting_id} variant="default" size="sm">
              {meeting.meeting_name}
            </Badge>
          ))}
        </div>
      );
    }

    if (note.connected_initiatives?.length) {
      entities.push(
        <div key="initiatives" className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Initiatives:</span>
          {note.connected_initiatives.map((initiative) => (
            <Badge key={initiative.initiative_id} variant="default" size="sm">
              {initiative.initiative_name}
            </Badge>
          ))}
        </div>
      );
    }

    if (note.connected_workstreams?.length) {
      entities.push(
        <div key="workstreams" className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Workstreams:</span>
          {note.connected_workstreams.map((workstream) => (
            <Badge key={workstream.workstream_id} variant="default" size="sm">
              {workstream.workstream_name}
            </Badge>
          ))}
        </div>
      );
    }

    return entities;
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {note.header}
          </h3>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Badge className={getImportanceColor(note.importance)}>
            {note.importance}
          </Badge>
        </div>
      </div>

      {/* Content Preview */}
      <div className="flex-1 mb-4">
        <div className="text-gray-600 text-sm leading-relaxed">
          <MarkdownRenderer 
            content={createContentPreview(note.body, 150)} 
            className="text-sm"
          />
        </div>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag, index) => (
              <Badge key={index} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Connected Entities */}
      {renderConnectedEntities().length > 0 && (
        <div className="mb-4 space-y-2">
          {renderConnectedEntities()}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              View
            </button>
            <button
              onClick={onEdit}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NoteCard;
