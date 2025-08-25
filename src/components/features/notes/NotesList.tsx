import React from 'react';
import type { NoteWithRelationships } from '../../../lib/types';
import NoteCard from './NoteCard';
import { EmptyState } from '../../shared';

interface NotesListProps {
  notes: NoteWithRelationships[];
  onViewNote: (note: NoteWithRelationships) => void;
  onEditNote: (note: NoteWithRelationships) => void;
  onDeleteNote: (id: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({ notes, onViewNote, onEditNote, onDeleteNote }) => {
  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes found"
        description="Create your first note to get started, or try adjusting your filters."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onView={() => onViewNote(note)}
            onEdit={() => onEditNote(note)}
            onDelete={() => onDeleteNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotesList;
