import { useState, useMemo } from 'react';
import type { TaskWithRelations, TasksFiltersState } from '../types';

const initialFilters: TasksFiltersState = {
  searchQuery: '',
  statusFilter: 'all',
  taskTypeFilter: 'all',
  groupBy: 'phase'
};

export const useTaskFilters = (tasks: TaskWithRelations[]) => {
  const [filters, setFilters] = useState<TasksFiltersState>(initialFilters);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Foundation', 'All Tasks'])
  );

  const updateFilters = (newFilters: Partial<TasksFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchLower = filters.searchQuery.toLowerCase().trim();
      
      const matchesSearch = filters.searchQuery === '' || 
                           (task.task_name && task.task_name.toLowerCase().includes(searchLower)) ||
                           (task.description && task.description.toLowerCase().includes(searchLower)) ||
                           (task.owner_name && task.owner_name.toLowerCase().includes(searchLower)) ||
                           (task.phase_name && task.phase_name.toLowerCase().includes(searchLower)) ||
                           (task.initiative_name && task.initiative_name.toLowerCase().includes(searchLower)) ||
                           (task.task_type?.type_name && task.task_type.type_name.toLowerCase().includes(searchLower));
      
      const matchesStatus = filters.statusFilter === 'all' || task.status === filters.statusFilter;
      const matchesType = filters.taskTypeFilter === 'all' || task.task_type?.type_name === filters.taskTypeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [tasks, filters]);

  const groupedTasks = useMemo(() => {
    if (filters.groupBy === 'none') {
      return { 'All Tasks': filteredTasks };
    }
    
    return filteredTasks.reduce((groups, task) => {
      let groupKey: string;
      switch (filters.groupBy) {
        case 'phase':
          groupKey = task.phase_name || 'Unknown Phase';
          break;
        case 'type':
          groupKey = task.task_type?.type_name || 'Unknown Type';
          break;
        case 'status':
          groupKey = task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        default:
          groupKey = 'All Tasks';
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
      return groups;
    }, {} as Record<string, TaskWithRelations[]>);
  }, [filteredTasks, filters.groupBy]);

  return {
    filters,
    expandedGroups,
    filteredTasks,
    groupedTasks,
    updateFilters,
    toggleGroup
  };
};
