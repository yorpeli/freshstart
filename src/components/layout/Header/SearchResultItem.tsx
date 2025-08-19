import React from 'react';
import { User, Calendar, CheckSquare, Target } from 'lucide-react';
import type { SearchResult } from '../../../hooks/useGlobalSearch';

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: (result: SearchResult) => void;
  query: string;
}

// Helper function to highlight matching text
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query || !text) return text;

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Find the first occurrence of the query in the text
  const index = textLower.indexOf(queryLower);
  
  if (index === -1) return text;

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  return (
    <>
      {before}
      <span className="bg-yellow-200 text-yellow-800 font-medium">{match}</span>
      {highlightText(after, query)}
    </>
  );
};

// Get icon for result type
const getResultIcon = (type: SearchResult['type']) => {
  const iconProps = { size: 16, className: 'text-gray-500' };
  
  switch (type) {
    case 'person':
      return <User {...iconProps} />;
    case 'meeting':
      return <Calendar {...iconProps} />;
    case 'task':
      return <CheckSquare {...iconProps} />;
    case 'phase':
      return <Target {...iconProps} />;
    default:
      return null;
  }
};

// Get result type label
const getTypeLabel = (type: SearchResult['type']) => {
  switch (type) {
    case 'person':
      return 'Person';
    case 'meeting':
      return 'Meeting';
    case 'task':
      return 'Task';
    case 'phase':
      return 'Phase';
    default:
      return '';
  }
};

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  result,
  isSelected,
  onClick,
  query
}) => {
  const handleClick = () => {
    onClick(result);
  };

  return (
    <div
      className={`
        px-4 py-3 cursor-pointer transition-colors duration-150
        ${isSelected 
          ? 'bg-primary-50 border-l-2 border-primary-500' 
          : 'hover:bg-gray-50'
        }
      `}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getResultIcon(result.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {highlightText(result.title, query)}
            </h4>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {getTypeLabel(result.type)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 truncate mt-1">
            {highlightText(result.subtitle, query)}
          </p>
          
          {result.context && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {highlightText(result.context, query)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};