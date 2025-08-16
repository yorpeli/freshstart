import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kesfmdnzvlcmlqofhyjp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug logging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET');

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
