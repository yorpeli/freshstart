import React, { useState } from 'react';
import type { NoteFilters } from '../../../lib/types';
import { Card } from '../../ui';

interface NotesFiltersProps {
  onUpdateFilters: (filters: Partial<NoteFilters>) => void;
  onClearFilters: () => void;
}

const NotesFilters: React.FC<NotesFiltersProps> = ({ onUpdateFilters, onClearFilters }) => {
  const [filters, setFilters] = useState<Partial<NoteFilters>>({});

  const importanceOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  ];

  const handleFilterChange = (key: keyof NoteFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onUpdateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Importance Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Importance
          </label>
          <div className="space-y-2">
            {importanceOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.importance === option.value}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleFilterChange('importance', option.value);
                    } else {
                      handleFilterChange('importance', undefined);
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            placeholder="Enter tags (comma separated)"
            value={filters.tags?.join(', ') || ''}
            onChange={(e) => {
              const tags = e.target.value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
              handleFilterChange('tags', tags.length > 0 ? tags : undefined);
            }}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              placeholder="From date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <input
              type="date"
              placeholder="To date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Connected Entity Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connected to
          </label>
          <select
            value={filters.connected_entity_type || ''}
            onChange={(e) => handleFilterChange('connected_entity_type', e.target.value || undefined)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All entities</option>
            <option value="phase">Phases</option>
            <option value="meeting">Meetings</option>
            <option value="initiative">Initiatives</option>
            <option value="workstream">Workstreams</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

export default NotesFilters;
