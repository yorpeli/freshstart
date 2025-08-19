import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useGlobalSearch } from '../../../hooks/useGlobalSearch';
import { SearchDropdown } from './SearchDropdown';

interface SearchBoxProps {
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { results, groupedResults, hasResults } = useGlobalSearch(debouncedQuery);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.trim().length >= 2);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !hasResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleResultSelect = (result: typeof results[0]) => {
    // Navigate based on result type
    switch (result.type) {
      case 'person':
        // For now, just close the search - navigation can be added later
        setIsOpen(false);
        setQuery('');
        setDebouncedQuery('');
        break;
      case 'meeting':
        // For now, just close the search - navigation can be added later
        setIsOpen(false);
        setQuery('');
        setDebouncedQuery('');
        break;
      case 'task':
        // For now, just close the search - navigation can be added later
        setIsOpen(false);
        setQuery('');
        setDebouncedQuery('');
        break;
      case 'phase':
        // Navigate to phase detail
        window.location.href = `/phases/${result.data.phase_id}`;
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus management
  const handleFocus = () => {
    if (query.trim().length >= 2) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={searchBoxRef} className={`relative ${className}`}>
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={20} 
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search people, meetings, tasks..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && hasResults && (
        <SearchDropdown
          results={results}
          groupedResults={groupedResults}
          selectedIndex={selectedIndex}
          onSelect={handleResultSelect}
          query={debouncedQuery}
        />
      )}
    </div>
  );
};