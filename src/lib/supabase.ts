import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kesfmdnzvlcmlqofhyjp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlc2ZtZG56dmxjbWxxb2ZoeWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTk3MTgsImV4cCI6MjA3MDY5NTcxOH0.7mr_leHTmSt24ILUFfLxgjfBlkcOMC4o40L-6UL5m3Y';

// Debug logging
console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Supabase Anon Key (first 20 chars):', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not set. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('phases').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      return false;
    }
    
    // Check if tables exist
    const tables = ['phases', 'workstreams', 'people', 'departments', 'meeting_types'];
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('*').limit(1);
        if (tableError) {
          console.warn(`⚠️ Table '${table}' not accessible:`, tableError.message);
        }
      } catch (err) {
        console.warn(`⚠️ Table '${table}' error:`, err);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err);
    return false;
  }
};

// Database table names
export const TABLES = {
  PHASES: 'phases',
  WORKSTREAMS: 'workstreams',
  PEOPLE: 'people',
  DEPARTMENTS: 'departments',
  MEETING_TYPES: 'meeting_types',
  INITIATIVES: 'initiatives',
  TASKS: 'tasks',
  MEETINGS: 'meetings',
  NOTES: 'notes',
  NOTE_PHASES: 'note_phases',
  NOTE_MEETINGS: 'note_meetings',
  NOTE_INITIATIVES: 'note_initiatives',
  NOTE_WORKSTREAMS: 'note_workstreams',
} as const;

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Notes CRUD operations
export const notesApi = {
  // Get all notes with relationships
  async getAllNotes() {
    const { data, error } = await supabase
      .from('notes_with_relationships')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get note by ID with relationships
  async getNoteById(id: string) {
    const { data, error } = await supabase
      .from('notes_with_relationships')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new note
  async createNote(noteData: any) {
    const { header, body, tags, importance, connected_phases, connected_meetings, connected_initiatives, connected_workstreams } = noteData;
    
    // Start a transaction
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        header,
        body,
        tags: tags || [],
        importance: importance || 'medium'
      })
      .select()
      .single();
    
    if (noteError) throw noteError;
    
    // Insert relationships
    const relationships = [];
    
    if (connected_phases?.length) {
      const phaseRelations = connected_phases.map(phaseId => ({
        note_id: note.id,
        phase_id: phaseId
      }));
      relationships.push(supabase.from('note_phases').insert(phaseRelations));
    }
    
    if (connected_meetings?.length) {
      const meetingRelations = connected_meetings.map(meetingId => ({
        note_id: note.id,
        meeting_id: meetingId
      }));
      relationships.push(supabase.from('note_meetings').insert(meetingRelations));
    }
    
    if (connected_initiatives?.length) {
      const initiativeRelations = connected_initiatives.map(initiativeId => ({
        note_id: note.id,
        initiative_id: initiativeId
      }));
      relationships.push(supabase.from('note_initiatives').insert(initiativeRelations));
    }
    
    if (connected_workstreams?.length) {
      const workstreamRelations = connected_workstreams.map(workstreamId => ({
        note_id: note.id,
        workstream_id: workstreamId
      }));
      relationships.push(supabase.from('note_workstreams').insert(workstreamRelations));
    }
    
    // Execute all relationship insertions
    if (relationships.length > 0) {
      await Promise.all(relationships);
    }
    
    return note;
  },

  // Update note
  async updateNote(id: string, noteData: any) {
    const { header, body, tags, importance, connected_phases, connected_meetings, connected_initiatives, connected_workstreams } = noteData;
    
    // Update note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .update({
        header,
        body,
        tags: tags || [],
        importance: importance || 'medium'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (noteError) throw noteError;
    
    // Delete existing relationships
    await Promise.all([
      supabase.from('note_phases').delete().eq('note_id', id),
      supabase.from('note_meetings').delete().eq('note_id', id),
      supabase.from('note_initiatives').delete().eq('note_id', id),
      supabase.from('note_workstreams').delete().eq('note_id', id)
    ]);
    
    // Insert new relationships
    const relationships = [];
    
    if (connected_phases?.length) {
      const phaseRelations = connected_phases.map(phaseId => ({
        note_id: id,
        phase_id: phaseId
      }));
      relationships.push(supabase.from('note_phases').insert(phaseRelations));
    }
    
    if (connected_meetings?.length) {
      const meetingRelations = connected_meetings.map(meetingId => ({
        note_id: id,
        meeting_id: meetingId
      }));
      relationships.push(supabase.from('note_meetings').insert(meetingRelations));
    }
    
    if (connected_initiatives?.length) {
      const initiativeRelations = connected_initiatives.map(initiativeId => ({
        note_id: id,
        initiative_id: initiativeId
      }));
      relationships.push(supabase.from('note_initiatives').insert(initiativeRelations));
    }
    
    if (connected_workstreams?.length) {
      const workstreamRelations = connected_workstreams.map(workstreamId => ({
        note_id: id,
        workstream_id: workstreamId
      }));
      relationships.push(supabase.from('note_workstreams').insert(workstreamRelations));
    }
    
    // Execute all relationship insertions
    if (relationships.length > 0) {
      await Promise.all(relationships);
    }
    
    return note;
  },

  // Delete note
  async deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Search notes
  async searchNotes(query: string) {
    const { data, error } = await supabase
      .rpc('search_notes', { search_query: query });
    
    if (error) throw error;
    return data;
  },

  // Get notes by entity
  async getNotesByEntity(entityType: string, entityId: number) {
    const { data, error } = await supabase
      .from('notes_by_entity')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get notes by filters
  async getNotesByFilters(filters: any) {
    let query = supabase
      .from('notes_with_relationships')
      .select('*');
    
    if (filters.search) {
      query = query.or(`header.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);
    }
    
    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags);
    }
    
    if (filters.importance) {
      query = query.eq('importance', filters.importance);
    }
    
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
