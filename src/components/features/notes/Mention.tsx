import React from 'react';

interface MentionProps {
  type: 'people' | 'tasks' | 'meetings';
  text: string;
  onClick?: () => void;
  className?: string;
}

const Mention: React.FC<MentionProps> = ({ type, text, onClick, className = '' }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'people':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300';
      case 'tasks':
        return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300';
      case 'meetings':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'people':
        return '👤';
      case 'tasks':
        return '✅';
      case 'meetings':
        return '📅';
      default:
        return '🔗';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'people':
        return 'Person';
      case 'tasks':
        return 'Task';
      case 'meetings':
        return 'Meeting';
      default:
        return 'Mention';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium
        border cursor-pointer transition-colors duration-200
        ${getTypeStyles()}
        ${className}
      `}
      onClick={onClick}
      title={`${getTypeLabel()}: ${text}`}
    >
      <span className="text-xs">{getTypeIcon()}</span>
      <span>{text}</span>
    </span>
  );
};

export default Mention;
