import { useState, useEffect, useCallback } from 'react';
import { notesApi } from '../lib/supabase';
import type { 
  Note, 
  NoteWithRelationships, 
  NoteFilters, 
  CreateNoteData, 
  UpdateNoteData 
} from '../lib/types';

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteWithRelationships[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NoteFilters>({});

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notesApi.getAllNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notes with filters
  const fetchNotesWithFilters = useCallback(async (newFilters: NoteFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await notesApi.getNotesByFilters(newFilters);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Search notes
  const searchNotes = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await notesApi.searchNotes(query);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search notes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create note
  const createNote = useCallback(async (noteData: CreateNoteData) => {
    try {
      setError(null);
      const newNote = await notesApi.createNote(noteData);
      // Refresh notes to include the new one
      await fetchNotes();
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  }, [fetchNotes]);

  // Update note
  const updateNote = useCallback(async (id: string, noteData: UpdateNoteData) => {
    try {
      setError(null);
      const updatedNote = await notesApi.updateNote(id, noteData);
      // Update the note in the local state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? { ...note, ...updatedNote } : note
        )
      );
      return updatedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  }, []);

  // Delete note
  const deleteNote = useCallback(async (id: string) => {
    try {
      setError(null);
      await notesApi.deleteNote(id);
      // Remove the note from local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  }, []);

  // Get note by ID
  const getNoteById = useCallback(async (id: string) => {
    try {
      setError(null);
      return await notesApi.getNoteById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch note');
      throw err;
    }
  }, []);

  // Get notes by entity
  const getNotesByEntity = useCallback(async (entityType: string, entityId: number) => {
    try {
      setError(null);
      const data = await notesApi.getNotesByEntity(entityType, entityId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity notes');
      throw err;
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<NoteFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchNotesWithFilters(updatedFilters);
  }, [filters, fetchNotesWithFilters]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    fetchNotes();
  }, [fetchNotes]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
    notes,
    loading,
    error,
    filters,
    fetchNotes,
    fetchNotesWithFilters,
    searchNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNotesByEntity,
    updateFilters,
    clearFilters,
  };
};
