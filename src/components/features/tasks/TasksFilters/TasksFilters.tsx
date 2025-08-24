import React from 'react';
import { Search } from 'lucide-react';
import type { TasksFiltersProps } from '../types';
import Card from '../../../ui/Card';

const TasksFilters: React.FC<TasksFiltersProps> = ({
  filters,
  taskTypes,
  workstreams,
  onFiltersChange
}) => {
  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search tasks, descriptions, owners, phases, workstreams..."
                value={filters.searchQuery}
                onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.statusFilter}
            onChange={(e) => onFiltersChange({ statusFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Task Type Filter */}
          <select
            value={filters.taskTypeFilter}
            onChange={(e) => onFiltersChange({ taskTypeFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            {taskTypes.map(type => (
              <option key={type.task_type_id} value={type.type_name}>
                {type.type_name.charAt(0).toUpperCase() + type.type_name.slice(1)}
              </option>
            ))}
          </select>

          {/* Workstream Filter */}
          <select
            value={filters.workstreamFilter}
            onChange={(e) => onFiltersChange({ workstreamFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Workstreams</option>
            {workstreams.map(workstream => (
              <option key={workstream.workstream_id} value={workstream.workstream_name}>
                {workstream.workstream_name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-') as [any, 'asc' | 'desc'];
              onFiltersChange({ sortBy, sortOrder });
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="due_date-asc">Due Date (Oldest First)</option>
            <option value="due_date-desc">Due Date (Newest First)</option>
            <option value="priority-asc">Priority (Low to High)</option>
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
            <option value="task_name-asc">Task Name (A-Z)</option>
            <option value="task_name-desc">Task Name (Z-A)</option>
            <option value="created_at-desc">Recently Created</option>
            <option value="created_at-asc">Oldest Created</option>
          </select>

          {/* Group By */}
          <select
            value={filters.groupBy}
            onChange={(e) => onFiltersChange({ groupBy: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="phase">Group by Phase</option>
            <option value="type">Group by Type</option>
            <option value="status">Group by Status</option>
            <option value="workstream">Group by Workstream</option>
            <option value="date">Group by Date</option>
            <option value="none">No Grouping</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default TasksFilters;
