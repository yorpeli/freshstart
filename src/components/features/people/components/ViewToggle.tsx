import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'cards' | 'table';
  onViewChange: (view: 'cards' | 'table') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
          currentView === 'cards'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <LayoutGrid size={16} />
        Cards
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
          currentView === 'table'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Table size={16} />
        Table
      </button>
    </div>
  );
};

export default ViewToggle;