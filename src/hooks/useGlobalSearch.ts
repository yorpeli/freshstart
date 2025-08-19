import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePeople, usePhases } from './useSupabaseQuery';
import { useTasks } from '../components/features/tasks/hooks/useTasks';
import { useMeetings } from './useMeetings';
import type { Person, Phase, Task, Meeting } from '../lib/types';
import { startOfMonth, endOfMonth } from 'date-fns';

export type SearchResultType = 'person' | 'meeting' | 'task' | 'phase';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  context?: string;
  data: Person | Meeting | Task | Phase;
  relevance: number;
}

// Utility function to calculate string similarity
const calculateRelevance = (query: string, text: string, isExactField = false): number => {
  if (!text || !query) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower === queryLower) return isExactField ? 100 : 90;
  
  // Starts with query
  if (textLower.startsWith(queryLower)) return isExactField ? 80 : 70;
  
  // Contains query
  if (textLower.includes(queryLower)) return isExactField ? 60 : 50;
  
  // Fuzzy matching (simple word boundary matching)
  const queryWords = queryLower.split(' ').filter(Boolean);
  const textWords = textLower.split(' ').filter(Boolean);
  
  let matchedWords = 0;
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        matchedWords++;
        break;
      }
    }
  }
  
  const wordMatchRatio = matchedWords / queryWords.length;
  return wordMatchRatio > 0.5 ? 30 : 0;
};

// Search functions for each entity type
const searchPeople = (people: Person[], query: string): SearchResult[] => {
  return people
    .map(person => {
      const fullName = `${person.first_name} ${person.last_name || ''}`.trim();
      const nameRelevance = calculateRelevance(query, fullName, true);
      const roleRelevance = calculateRelevance(query, person.role_title || '');
      const emailRelevance = calculateRelevance(query, person.email || '');
      
      const maxRelevance = Math.max(nameRelevance, roleRelevance, emailRelevance);
      
      if (maxRelevance > 0) {
        return {
          id: `person-${person.person_id}`,
          type: 'person' as const,
          title: fullName,
          subtitle: person.role_title || 'Team Member',
          context: person.email,
          data: person,
          relevance: maxRelevance
        };
      }
      return null;
    })
    .filter(Boolean) as SearchResult[];
};

const searchMeetings = (meetings: Meeting[], query: string): SearchResult[] => {
  return meetings
    .map(meeting => {
      const nameRelevance = calculateRelevance(query, meeting.meeting_name, true);
      const typeRelevance = calculateRelevance(query, meeting.meeting_type);
      const phaseRelevance = calculateRelevance(query, meeting.phase_name);
      
      // Search attendees
      const attendeesText = meeting.attendees.join(' ');
      const attendeesRelevance = calculateRelevance(query, attendeesText);
      
      const maxRelevance = Math.max(nameRelevance, typeRelevance, phaseRelevance, attendeesRelevance);
      
      if (maxRelevance > 0) {
        return {
          id: `meeting-${meeting.meeting_id}`,
          type: 'meeting' as const,
          title: meeting.meeting_name,
          subtitle: meeting.meeting_type,
          context: `${meeting.phase_name} • ${meeting.attendees.length} attendees`,
          data: meeting,
          relevance: maxRelevance
        };
      }
      return null;
    })
    .filter(Boolean) as SearchResult[];
};

const searchTasks = (tasks: any[], query: string): SearchResult[] => {
  return tasks
    .map(task => {
      const nameRelevance = calculateRelevance(query, task.task_name, true);
      const descRelevance = calculateRelevance(query, task.description || '');
      const ownerRelevance = calculateRelevance(query, task.owner_name || '');
      const phaseRelevance = calculateRelevance(query, task.phase_name || '');
      
      const maxRelevance = Math.max(nameRelevance, descRelevance, ownerRelevance, phaseRelevance);
      
      if (maxRelevance > 0) {
        return {
          id: `task-${task.task_id}`,
          type: 'task' as const,
          title: task.task_name,
          subtitle: task.owner_name || 'Unassigned',
          context: `${task.phase_name} • ${task.status}`,
          data: task,
          relevance: maxRelevance
        };
      }
      return null;
    })
    .filter(Boolean) as SearchResult[];
};

const searchPhases = (phases: Phase[], query: string): SearchResult[] => {
  return phases
    .map(phase => {
      const nameRelevance = calculateRelevance(query, phase.phase_name, true);
      const descRelevance = calculateRelevance(query, phase.description || '');
      
      const maxRelevance = Math.max(nameRelevance, descRelevance);
      
      if (maxRelevance > 0) {
        return {
          id: `phase-${phase.phase_id}`,
          type: 'phase' as const,
          title: phase.phase_name,
          subtitle: `Week ${phase.start_week}-${phase.end_week}`,
          context: `${phase.learning_percentage}% learning • ${phase.value_percentage}% value`,
          data: phase,
          relevance: maxRelevance
        };
      }
      return null;
    })
    .filter(Boolean) as SearchResult[];
};

export const useGlobalSearch = (query: string) => {
  // Fetch data from existing hooks
  const { data: people = [] } = usePeople();
  const { data: phases = [] } = usePhases();
  const { data: tasks = [] } = useTasks();
  
  // Get meetings from current month (to avoid loading too much data)
  const currentDate = new Date();
  const { data: meetings = [] } = useMeetings(
    startOfMonth(currentDate),
    endOfMonth(currentDate)
  );

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();
    
    // Perform searches on all entities
    const peopleResults = searchPeople(people, trimmedQuery);
    const meetingResults = searchMeetings(meetings, trimmedQuery);
    const taskResults = searchTasks(tasks, trimmedQuery);
    const phaseResults = searchPhases(phases, trimmedQuery);

    // Combine and sort by relevance
    const allResults = [
      ...peopleResults,
      ...meetingResults,
      ...taskResults,
      ...phaseResults
    ].sort((a, b) => b.relevance - a.relevance);

    // Limit results to prevent overwhelming UI
    return allResults.slice(0, 20);
  }, [query, people, meetings, tasks, phases]);

  // Group results by type for UI organization
  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      person: [],
      meeting: [],
      task: [],
      phase: []
    };

    searchResults.forEach(result => {
      groups[result.type].push(result);
    });

    return groups;
  }, [searchResults]);

  return {
    results: searchResults,
    groupedResults,
    hasResults: searchResults.length > 0,
    isLoading: false // All data is already loaded by individual hooks
  };
};