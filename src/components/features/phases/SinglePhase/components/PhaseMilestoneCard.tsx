import React from 'react';
import { Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Badge from '../../../../ui/Badge';
import type { Task } from '../../../../../lib/types';

interface PhaseMilestoneCardProps {
  task: Task;
  className?: string;
}

const PhaseMilestoneCard: React.FC<PhaseMilestoneCardProps> = ({ task, className = '' }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'in_progress':
        return <Clock size={16} className="text-blue-500" />;
      case 'blocked':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getOwnerName = () => {
    // The people data comes from the joined query as 'people' not 'owner'
    if (task.people && 'first_name' in task.people) {
      const person = task.people as any;
      return `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unassigned';
    }
    return 'Unassigned';
  };

  return (
    <div 
      className={`border rounded-lg p-4 hover:border-purple-300 transition-colors bg-red-50 border-red-200 ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(task.status)}
          <h3 className="font-medium text-gray-900">{task.task_name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={task.status === 'completed' ? 'success' : 
                     task.status === 'in_progress' ? 'info' : 
                     task.status === 'blocked' ? 'error' : 'outline'}
            className="text-xs"
          >
            {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-700 text-sm mb-3">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <Calendar size={14} />
          <span>{formatDate(task.due_date)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <User size={14} />
          <span>{getOwnerName()}</span>
        </div>
      </div>
    </div>
  );
};

export default PhaseMilestoneCard;
