import { useState, useMemo } from 'react';
import type { Person } from '../../../../lib/types';
import type { PeopleFiltersState } from '../types';

const initialFilters: PeopleFiltersState = {
  searchQuery: '',
  departmentFilter: 'all',
  engagementFilter: 'all',
  sortBy: 'last_name',
  sortOrder: 'asc'
};

export const usePeopleFilters = (people: Person[]) => {
  const [filters, setFilters] = useState<PeopleFiltersState>(initialFilters);

  const updateFilters = (newFilters: Partial<PeopleFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredAndSortedPeople = useMemo(() => {
    // First filter
    const filtered = people.filter(person => {
      const searchLower = filters.searchQuery.toLowerCase().trim();
      
      const matchesSearch = filters.searchQuery === '' || 
                           (person.first_name && person.first_name.toLowerCase().includes(searchLower)) ||
                           (person.last_name && person.last_name.toLowerCase().includes(searchLower)) ||
                           (person.role_title && person.role_title.toLowerCase().includes(searchLower)) ||
                           (person.department?.department_name && person.department.department_name.toLowerCase().includes(searchLower));
      
      const matchesDepartment = filters.departmentFilter === 'all' || 
                               (person.department?.department_name || 'Unknown Department') === filters.departmentFilter;
      
      const matchesEngagement = (() => {
        if (filters.engagementFilter === 'all') return true;
        const engagement = person.engagement_priority || 0;
        switch (filters.engagementFilter) {
          case 'high': return engagement >= 4;
          case 'medium': return engagement === 3;
          case 'low': return engagement >= 1 && engagement <= 2;
          case 'none': return engagement === 0;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesDepartment && matchesEngagement;
    });

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'last_name':
          aValue = (a.last_name || '').toLowerCase();
          bValue = (b.last_name || '').toLowerCase();
          break;
        case 'first_name':
          aValue = (a.first_name || '').toLowerCase();
          bValue = (b.first_name || '').toLowerCase();
          break;
        case 'role_title':
          aValue = (a.role_title || '').toLowerCase();
          bValue = (b.role_title || '').toLowerCase();
          break;
        case 'department':
          aValue = (a.department?.department_name || 'Unknown Department').toLowerCase();
          bValue = (b.department?.department_name || 'Unknown Department').toLowerCase();
          break;
        case 'engagement_priority':
          aValue = a.engagement_priority || 0;
          bValue = b.engagement_priority || 0;
          break;
        case 'influence_level':
          aValue = a.influence_level || 0;
          bValue = b.influence_level || 0;
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
  }, [people, filters]);

  // Group people by department for card view
  const peopleByDepartment = useMemo(() => {
    return filteredAndSortedPeople.reduce((acc, person) => {
      const deptName = person.department?.department_name || 'Unknown Department';
      if (!acc[deptName]) {
        acc[deptName] = [];
      }
      acc[deptName].push(person);
      return acc;
    }, {} as Record<string, Person[]>);
  }, [filteredAndSortedPeople]);

  const departmentCount = Object.keys(peopleByDepartment).length;

  return {
    filters,
    filteredPeople: filteredAndSortedPeople,
    peopleByDepartment,
    departmentCount,
    updateFilters
  };
};