import React from 'react';
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react';

interface TaskPriorityBadgeProps {
  priority: number | null;
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  const getPriorityConfig = (priority: number | null) => {
    switch (priority) {
      case 3:
        return {
          label: 'P3',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      case 2:
        return {
          label: 'P2',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <ArrowDown className="h-3 w-3" />
        };
      case 1:
        return {
          label: 'P1',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Minus className="h-3 w-3" />
        };
      default:
        return {
          label: 'P0',
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: <Minus className="h-3 w-3" />
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </div>
  );
};
