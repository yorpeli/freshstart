import React from 'react';
import { Search } from 'lucide-react';
import Card from '../../../ui/Card';
import { useDepartments } from '../../../../hooks/useSupabaseQuery';
import type { PeopleFiltersState } from '../types';

interface PeopleFiltersProps {
  filters: PeopleFiltersState;
  onFiltersChange: (filters: Partial<PeopleFiltersState>) => void;
}

const PeopleFilters: React.FC<PeopleFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
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
                placeholder="Search people by name, role, department..."
                value={filters.searchQuery}
                onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Department Filter */}
          <select
            value={filters.departmentFilter}
            onChange={(e) => onFiltersChange({ departmentFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            disabled={departmentsLoading}
          >
            <option value="all">All Departments</option>
            {departments
              .sort((a, b) => a.department_name.localeCompare(b.department_name))
              .map((dept) => (
                <option key={dept.department_id} value={dept.department_name}>
                  {dept.department_name}
                </option>
              ))}
            <option value="Unknown Department">Unknown Department</option>
          </select>

          {/* Engagement Filter */}
          <select
            value={filters.engagementFilter}
            onChange={(e) => onFiltersChange({ engagementFilter: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Engagement Levels</option>
            <option value="high">High (4-5)</option>
            <option value="medium">Medium (3)</option>
            <option value="low">Low (1-2)</option>
            <option value="none">Not Set (0)</option>
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
            <option value="last_name-asc">Last Name (A-Z)</option>
            <option value="last_name-desc">Last Name (Z-A)</option>
            <option value="first_name-asc">First Name (A-Z)</option>
            <option value="first_name-desc">First Name (Z-A)</option>
            <option value="role_title-asc">Role (A-Z)</option>
            <option value="role_title-desc">Role (Z-A)</option>
            <option value="department-asc">Department (A-Z)</option>
            <option value="department-desc">Department (Z-A)</option>
            <option value="engagement_priority-desc">Engagement (High to Low)</option>
            <option value="engagement_priority-asc">Engagement (Low to High)</option>
            <option value="influence_level-desc">Influence (High to Low)</option>
            <option value="influence_level-asc">Influence (Low to High)</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default PeopleFilters;