import React from 'react';
import { Calendar, Target, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import type { WorkstreamCardProps } from '../types';
import { useWorkstreamPriority } from '../hooks/useWorkstreamPriority';

const WorkstreamCard: React.FC<WorkstreamCardProps> = ({ 
  workstream, 
  className = '',
  variant = 'default'
}) => {
  const priorityDisplay = useWorkstreamPriority(workstream.priority);

  const renderIcon = () => {
    const IconComponent = {
      Target,
      AlertCircle, 
      CheckCircle,
      Clock
    }[priorityDisplay.iconName] || Target;

    return <IconComponent size={16} className={priorityDisplay.iconColor} />;
  };

  return (
    <Card 
      className={`hover:shadow-md transition-shadow duration-200 border-l-4 ${priorityDisplay.borderColor} ${className}`}
    >
      {/* Workstream Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {workstream.workstream_name}
          </h3>
          {variant === 'default' && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {workstream.description}
            </p>
          )}
        </div>
      </div>

      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {renderIcon()}
          <span className="text-sm font-medium text-gray-700">Priority</span>
        </div>
        <Badge className={`text-xs ${priorityDisplay.colorClass}`}>
          {priorityDisplay.label}
        </Badge>
      </div>

      {/* Color Indicator */}
      <div className="flex items-center space-x-2 mb-4">
        <div 
          className="w-4 h-4 rounded-full border border-gray-200"
          style={{ backgroundColor: workstream.color || '#6b7280' }}
        />
        <span className="text-xs text-gray-500">Theme Color</span>
      </div>

      {/* Status Footer */}
      {variant === 'default' && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>Created {new Date(workstream.created_at).toLocaleDateString()}</span>
          </div>
          <div className="text-xs text-gray-400">
            ID: {workstream.workstream_id}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WorkstreamCard;