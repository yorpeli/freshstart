import React from 'react';
import { Search, Calendar, Clock, Users } from 'lucide-react';
import type { MeetingsFiltersProps } from '../types';
import Card from '../../../ui/Card';

const MeetingsFilters: React.FC<MeetingsFiltersProps> = ({
  filters,
  phases,
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
                placeholder="Search meetings, attendees, locations, types..."
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
            <option value="not_scheduled">Not Scheduled</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Phase Filter */}
          <select
            value={filters.phaseFilter}
            onChange={(e) => onFiltersChange({ phaseFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Phases</option>
            {phases.map(phase => (
              <option key={phase.phase_id} value={phase.phase_id.toString()}>
                {phase.phase_number}. {phase.phase_name}
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
            <option value="none">None (Unassigned)</option>
            {workstreams.map(workstream => (
              <option key={workstream.workstream_id} value={workstream.workstream_id.toString()}>
                {workstream.workstream_name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={filters.dateFilter}
            onChange={(e) => onFiltersChange({ dateFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this_week">This Week</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
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
            <option value="scheduled_date-asc">Date (Oldest First)</option>
            <option value="scheduled_date-desc">Date (Newest First)</option>
            <option value="meeting_name-asc">Name (A-Z)</option>
            <option value="meeting_name-desc">Name (Z-A)</option>
            <option value="duration_minutes-asc">Duration (Shortest First)</option>
            <option value="duration_minutes-desc">Duration (Longest First)</option>
            <option value="created_at-desc">Recently Created</option>
            <option value="created_at-asc">Oldest Created</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default MeetingsFilters;
