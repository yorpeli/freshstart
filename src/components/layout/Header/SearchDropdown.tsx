import React from 'react';
import { SearchResultItem } from './SearchResultItem';
import type { SearchResult, SearchResultType } from '../../../hooks/useGlobalSearch';

interface SearchDropdownProps {
  results: SearchResult[];
  groupedResults: Record<SearchResultType, SearchResult[]>;
  selectedIndex: number;
  onSelect: (result: SearchResult) => void;
  query: string;
}

// Type labels for section headers
const TYPE_LABELS: Record<SearchResultType, string> = {
  person: 'People',
  meeting: 'Meetings',
  task: 'Tasks',
  phase: 'Phases'
};

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  results,
  groupedResults,
  selectedIndex,
  onSelect,
  query
}) => {
  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50">
        <div className="px-4 py-6 text-center text-gray-500">
          <p className="text-sm">No results found for "{query}"</p>
          <p className="text-xs mt-1">Try searching for people, meetings, tasks, or phases</p>
        </div>
      </div>
    );
  }

  // Group results with non-empty sections only
  const sectionsToShow = Object.entries(groupedResults)
    .filter(([_, items]) => items.length > 0)
    .map(([type, items]) => ({
      type: type as SearchResultType,
      label: TYPE_LABELS[type as SearchResultType],
      items
    }));

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-96 overflow-y-auto">
      {sectionsToShow.map(({ type, label, items }, sectionIndex) => {
        // Calculate the starting index for this section in the flat results array
        const sectionStartIndex = results.findIndex(result => result.type === type);
        
        return (
          <div key={type}>
            {/* Section header - only show if there are multiple sections */}
            {sectionsToShow.length > 1 && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {label} ({items.length})
                </h3>
              </div>
            )}
            
            {/* Section items */}
            <div>
              {items.slice(0, 5).map((result, itemIndex) => {
                // Find the actual index in the flat results array
                const flatIndex = results.findIndex(r => r.id === result.id);
                
                return (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    isSelected={flatIndex === selectedIndex}
                    onClick={onSelect}
                    query={query}
                  />
                );
              })}
              
              {/* Show more indicator if there are more items */}
              {items.length > 5 && (
                <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                  +{items.length - 5} more {label.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Footer with search tips */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </p>
      </div>
    </div>
  );
};