import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { Person } from '../../../../lib/types';

interface SearchableManagerDropdownProps {
  people: Person[];
  selectedManagerId: number | null;
  onSelect: (managerId: number | null) => void;
  placeholder?: string;
}

const SearchableManagerDropdown: React.FC<SearchableManagerDropdownProps> = ({
  people,
  selectedManagerId,
  onSelect,
  placeholder = "Select manager..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedManager = people.find(p => p.person_id === selectedManagerId);
  
  const filteredPeople = people
    .filter(person => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        (person.first_name?.toLowerCase().includes(query)) ||
        (person.last_name?.toLowerCase().includes(query)) ||
        (person.role_title?.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      const aFirstName = (a.first_name || '').toLowerCase();
      const bFirstName = (b.first_name || '').toLowerCase();
      return aFirstName.localeCompare(bFirstName);
    });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (person: Person | null) => {
    onSelect(person?.person_id || null);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setSearchQuery('');
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white hover:bg-gray-50 focus:border-primary-500 focus:outline-none flex items-center justify-between"
      >
        <span className={selectedManager ? 'text-gray-900' : 'text-gray-500'}>
          {selectedManager 
            ? `${selectedManager.first_name} ${selectedManager.last_name} (${selectedManager.role_title})`
            : placeholder
          }
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search managers..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {/* Clear Selection Option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
            >
              <X size={16} className="text-gray-400" />
              <span className="text-gray-600">No Manager</span>
            </button>

            {filteredPeople.length > 0 ? (
              filteredPeople.map((person) => (
                <button
                  key={person.person_id}
                  type="button"
                  onClick={() => handleSelect(person)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    selectedManagerId === person.person_id ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                  }`}
                >
                  <span className="font-medium">
                    {person.first_name} {person.last_name}
                    {person.role_title && (
                      <span className="font-normal text-gray-500 ml-2">({person.role_title})</span>
                    )}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No managers found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableManagerDropdown;