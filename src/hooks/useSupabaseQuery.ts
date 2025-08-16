import { useQuery } from '@tanstack/react-query';
import { supabase, TABLES, handleSupabaseError } from '../lib/supabase';
import type { Phase, Workstream, Person, Department, MeetingType } from '../lib/types';

// Generic hook for fetching data from Supabase
export const useSupabaseQuery = <T>(
  table: string,
  query?: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    retry?: number;
    retryDelay?: number;
  }
) => {
  return useQuery({
    queryKey: [table, query],
    queryFn: async (): Promise<T[]> => {
      try {
        let queryBuilder = supabase.from(table).select('*');
        
        if (query) {
          queryBuilder = queryBuilder.eq('query', query);
        }
        
        const { data, error } = await queryBuilder;
        
        if (error) {
          throw new Error(handleSupabaseError(error));
        }
        
        return data || [];
      } catch (err) {
        console.error(`Error fetching from ${table}:`, err);
        throw err;
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    retry: options?.retry ?? 1,
    retryDelay: options?.retryDelay ?? 1000,
  });
};

// Specific hooks for each entity
export const usePhases = () => {
  return useSupabaseQuery<Phase>(TABLES.PHASES);
};

// Hook for fetching a single phase by ID
export const useSinglePhase = (phaseId: string | undefined) => {
  return useQuery({
    queryKey: ['phase', phaseId],
    queryFn: async (): Promise<Phase | null> => {
      if (!phaseId) throw new Error('Phase ID is required');
      
      try {
        const { data, error } = await supabase
          .from(TABLES.PHASES)
          .select('*')
          .eq('phase_id', phaseId)
          .single();
        
        if (error) {
          throw new Error(handleSupabaseError(error));
        }
        
        return data;
      } catch (err) {
        console.error(`Error fetching phase ${phaseId}:`, err);
        throw err;
      }
    },
    enabled: !!phaseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
};

export const useWorkstreams = () => {
  return useSupabaseQuery<Workstream>(TABLES.WORKSTREAMS, undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const usePeople = () => {
  return useSupabaseQuery<Person>(TABLES.PEOPLE);
};

export const useDepartments = () => {
  return useSupabaseQuery<Department>(TABLES.DEPARTMENTS);
};

export const useMeetingTypes = () => {
  return useSupabaseQuery<MeetingType>(TABLES.MEETING_TYPES);
};

// Hook for people with department and reporting relationships
export const usePeopleWithRelations = () => {
  return useQuery({
    queryKey: [TABLES.PEOPLE, 'with-relations'],
    queryFn: async (): Promise<Person[]> => {
      const { data: people, error: peopleError } = await supabase
        .from(TABLES.PEOPLE)
        .select(`
          *,
          department:departments(*)
        `);
      
      if (peopleError) {
        throw new Error(handleSupabaseError(peopleError));
      }
      
      // Create a map of all people for easy lookup
      const peopleWithRelations = people || [];
      const allPeopleMap = new Map<number, Person>();
      
      // First pass: create map of all people
      peopleWithRelations.forEach(person => {
        allPeopleMap.set(person.person_id, { 
          ...person, 
          direct_reports: [],
          reports_to: undefined 
        });
      });
      
      // Second pass: link managers and build relationships
      const peopleMap = new Map<number, Person>();
      peopleWithRelations.forEach(person => {
        const reports_to = person.reporting_manager_id ? allPeopleMap.get(person.reporting_manager_id) : undefined;
        const personWithManager = { 
          ...person, 
          direct_reports: [],
          reports_to 
        };
        peopleMap.set(person.person_id, personWithManager);
      });
      
      // Third pass: build direct_reports relationships
      peopleWithRelations.forEach(person => {
        if (person.reporting_manager_id && peopleMap.has(person.reporting_manager_id)) {
          const manager = peopleMap.get(person.reporting_manager_id)!;
          if (!manager.direct_reports) {
            manager.direct_reports = [];
          }
          manager.direct_reports.push(peopleMap.get(person.person_id)!);
        }
      });
      
      return Array.from(peopleMap.values());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
