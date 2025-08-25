import React, { useState } from 'react';
import { useNotes } from '../../../hooks/useNotes';
import type { NoteWithRelationships, CreateNoteData } from '../../../lib/types';
import NotesList from './NotesList';
import NoteForm from './NoteForm';
import NoteViewModal from './NoteViewModal';
import NotesFilters from './NotesFilters';
import NotesSearch from './NotesSearch';
import { ViewHeader } from '../../shared';
import { LoadingState, ErrorState } from '../../shared';

const NotesContainer: React.FC = () => {
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    updateFilters,
    clearFilters,
    searchNotes
  } = useNotes();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithRelationships | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteWithRelationships | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateNote = async (noteData: CreateNoteData) => {
    try {
      await createNote(noteData);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleUpdateNote = async (id: string, noteData: Partial<CreateNoteData>) => {
    try {
      await updateNote(id, noteData);
      setEditingNote(null);
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchNotes(query);
    }
  };

  if (loading && notes.length === 0) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Notes"
        description="Capture thoughts, insights, and observations"
        action={
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            New Note
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <NotesFilters
            onUpdateFilters={updateFilters}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <NotesSearch
            value={searchQuery}
            onSearch={handleSearch}
            placeholder="Search notes..."
          />

          {/* Notes List */}
          <NotesList
            notes={notes}
            onViewNote={setViewingNote}
            onEditNote={setEditingNote}
            onDeleteNote={handleDeleteNote}
          />
        </div>
      </div>

      {/* Create Note Modal */}
      {showCreateForm && (
        <NoteForm
          mode="create"
          onSubmit={handleCreateNote}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <NoteForm
          mode="edit"
          note={editingNote}
          onSubmit={(noteData) => handleUpdateNote(editingNote.id, noteData)}
          onCancel={() => setEditingNote(null)}
        />
      )}

      {/* View Note Modal */}
      {viewingNote && (
        <NoteViewModal
          note={viewingNote}
          isOpen={!!viewingNote}
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
  );
};

export default NotesContainer;
