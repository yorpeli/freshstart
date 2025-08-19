import { useState, useMemo } from 'react';
import type { TaskWithRelations, TasksFiltersState } from '../types';

const initialFilters: TasksFiltersState = {
  searchQuery: '',
  statusFilter: 'all',
  taskTypeFilter: 'all',
  groupBy: 'phase',
  sortBy: 'due_date',
  sortOrder: 'asc'
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

  const sortedAndFilteredTasks = useMemo(() => {
    // First filter
    const filtered = tasks.filter(task => {
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

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'due_date':
          aValue = a.due_date ? new Date(a.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          bValue = b.due_date ? new Date(b.due_date).getTime() : Number.MAX_SAFE_INTEGER;
          break;
        case 'priority':
          // Higher priority number = lower priority, so we reverse the comparison
          aValue = a.priority || 999; // No priority = lowest priority
          bValue = b.priority || 999;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'task_name':
          aValue = a.task_name.toLowerCase();
          bValue = b.task_name.toLowerCase();
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
  }, [tasks, filters]);

  const groupedTasks = useMemo(() => {
    if (filters.groupBy === 'none') {
      return { 'All Tasks': sortedAndFilteredTasks };
    }
    
    const groups = sortedAndFilteredTasks.reduce((groups, task) => {
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
        case 'date':
          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            if (dueDate < today) {
              groupKey = 'Overdue';
            } else if (dueDate.toDateString() === today.toDateString()) {
              groupKey = 'Due Today';
            } else if (dueDate.toDateString() === tomorrow.toDateString()) {
              groupKey = 'Due Tomorrow';
            } else if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
              groupKey = 'Due This Week';
            } else {
              // Group by calendar month
              const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
              ];
              const month = monthNames[dueDate.getMonth()];
              const year = dueDate.getFullYear();
              const currentYear = today.getFullYear();
              
              if (year === currentYear) {
                groupKey = month;
              } else if (year === currentYear + 1) {
                groupKey = `${month} ${year}`;
              } else if (year === currentYear - 1) {
                groupKey = `${month} ${year}`;
              } else {
                groupKey = `${month} ${year}`;
              }
            }
          } else {
            groupKey = 'No Due Date';
          }
          break;
        default:
          groupKey = 'All Tasks';
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
      return groups;
    }, {} as Record<string, TaskWithRelations[]>);

    // Sort date groups in chronological order
    if (filters.groupBy === 'date') {
      const sortedGroups: Record<string, TaskWithRelations[]> = {};
      const groupOrder = [
        'Overdue',
        'Due Today', 
        'Due Tomorrow',
        'Due This Week'
      ];
      
      // Add immediate groups first
      groupOrder.forEach(key => {
        if (groups[key]) {
          sortedGroups[key] = groups[key];
        }
      });
      
      // Add month groups in chronological order
      const monthGroups = Object.keys(groups).filter(key => 
        !groupOrder.includes(key) && key !== 'No Due Date'
      );
      
      monthGroups.sort((a, b) => {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Extract month and year from group keys
        const getMonthYear = (key: string) => {
          const parts = key.split(' ');
          if (parts.length === 1) {
            // Current year, just month name
            const monthIndex = monthNames.indexOf(parts[0]);
            return { month: monthIndex, year: new Date().getFullYear() };
          } else {
            // Month + year format
            const monthIndex = monthNames.indexOf(parts[0]);
            const year = parseInt(parts[1]);
            return { month: monthIndex, year };
          }
        };
        
        const aInfo = getMonthYear(a);
        const bInfo = getMonthYear(b);
        
        if (aInfo.year !== bInfo.year) {
          return aInfo.year - bInfo.year;
        }
        return aInfo.month - bInfo.month;
      });
      
      monthGroups.forEach(key => {
        sortedGroups[key] = groups[key];
      });
      
      // Add "No Due Date" at the end
      if (groups['No Due Date']) {
        sortedGroups['No Due Date'] = groups['No Due Date'];
      }
      
      return sortedGroups;
    }
    
    return groups;
  }, [sortedAndFilteredTasks, filters.groupBy]);

  return {
    filters,
    expandedGroups,
    filteredTasks: sortedAndFilteredTasks,
    groupedTasks,
    updateFilters,
    toggleGroup
  };
};
