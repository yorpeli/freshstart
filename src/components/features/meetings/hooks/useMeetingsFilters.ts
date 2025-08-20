import { useState, useMemo } from 'react';
import type { MeetingWithRelations, MeetingsFiltersState } from '../types';

const initialFilters: MeetingsFiltersState = {
  searchQuery: '',
  statusFilter: 'all',
  meetingTypeFilter: 'all',
  dateFilter: 'all',
  sortBy: 'scheduled_date',
  sortOrder: 'desc'
};

export const useMeetingsFilters = (meetings: MeetingWithRelations[]) => {
  const [filters, setFilters] = useState<MeetingsFiltersState>(initialFilters);

  const updateFilters = (newFilters: Partial<MeetingsFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredAndSortedMeetings = useMemo(() => {
    // First filter
    const filtered = meetings.filter(meeting => {
      const searchLower = filters.searchQuery.toLowerCase().trim();
      
      const matchesSearch = filters.searchQuery === '' || 
                           (meeting.meeting_name && meeting.meeting_name.toLowerCase().includes(searchLower)) ||
                           (meeting.location_platform && meeting.location_platform.toLowerCase().includes(searchLower)) ||
                           (meeting.meeting_type?.type_name && meeting.meeting_type.type_name.toLowerCase().includes(searchLower)) ||
                           (meeting.attendees && meeting.attendees.some(attendee => 
                             attendee.name.toLowerCase().includes(searchLower)
                           ));
      
      const matchesStatus = filters.statusFilter === 'all' || meeting.status === filters.statusFilter;
      const matchesType = filters.meetingTypeFilter === 'all' || meeting.meeting_type?.type_name === filters.meetingTypeFilter;
      
      // Date filtering
      let matchesDate = true;
      if (filters.dateFilter !== 'all') {
        const meetingDate = new Date(meeting.scheduled_date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        switch (filters.dateFilter) {
          case 'today':
            matchesDate = meetingDate.toDateString() === today.toDateString();
            break;
          case 'tomorrow':
            matchesDate = meetingDate.toDateString() === tomorrow.toDateString();
            break;
          case 'this_week':
            matchesDate = meetingDate >= today && meetingDate <= nextWeek;
            break;
          case 'past':
            matchesDate = meetingDate < today;
            break;
          case 'upcoming':
            matchesDate = meetingDate >= today;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'scheduled_date':
          aValue = new Date(a.scheduled_date).getTime();
          bValue = new Date(b.scheduled_date).getTime();
          break;
        case 'meeting_name':
          aValue = a.meeting_name.toLowerCase();
          bValue = b.meeting_name.toLowerCase();
          break;
        case 'duration_minutes':
          aValue = a.duration_minutes || 0;
          bValue = b.duration_minutes || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return filters.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return filters.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [meetings, filters]);

  return {
    filters,
    filteredMeetings: filteredAndSortedMeetings,
    updateFilters
  };
};
