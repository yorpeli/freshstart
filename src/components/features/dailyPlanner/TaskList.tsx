import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Search, Plus } from 'lucide-react';
import { format, isToday } from 'date-fns';

interface TaskListProps {
  selectedDate: Date;
}

interface Task {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  priority: number;
  status: string;
  phase: string;
  initiative: string;
  owner: string;
  taskType: string;
  estimatedMinutes?: number;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate: _selectedDate }) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'upcoming'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - will be replaced with real data from Supabase
  const tasks: Task[] = [
    {
      id: 11,
      name: 'Review Q3 OKRs',
      description: 'Examine current quarter objectives and key results related to onboarding',
      dueDate: '2025-09-15',
      priority: 1,
      status: 'not_started',
      phase: 'Foundation',
      initiative: 'Week 1: Internal Foundation',
      owner: 'Yonatan Orpeli',
      taskType: 'research',
      estimatedMinutes: 120,
    },
    {
      id: 10,
      name: 'Review Previous PRDs',
      description: 'Analyze past product requirement documents for onboarding initiatives',
      dueDate: '2025-09-15',
      priority: 1,
      status: 'not_started',
      phase: 'Foundation',
      initiative: 'Week 1: Internal Foundation',
      owner: 'Yonatan Orpeli',
      taskType: 'research',
      estimatedMinutes: 90,
    },
    {
      id: 17,
      name: 'Slack Channels and Calendar',
      description: 'Join relevant Slack channels and gain calendar access to key meetings',
      dueDate: '2025-09-16',
      priority: 2,
      status: 'not_started',
      phase: 'Foundation',
      initiative: 'Week 1: Internal Foundation',
      owner: 'Yonatan Orpeli',
      taskType: 'setup',
      estimatedMinutes: 30,
    },
    {
      id: 15,
      name: 'Analytics Platforms Access',
      description: 'Gain access to analytics dashboards and reporting tools',
      dueDate: '2025-09-16',
      priority: 2,
      status: 'not_started',
      phase: 'Foundation',
      initiative: 'Week 1: Internal Foundation',
      owner: 'Yonatan Orpeli',
      taskType: 'setup',
      estimatedMinutes: 45,
    },
    {
      id: 16,
      name: 'CRM and Support Tools',
      description: 'Set up access to customer relationship management and support platforms',
      dueDate: '2025-09-16',
      priority: 2,
      status: 'not_started',
      phase: 'Foundation',
      initiative: 'Week 1: Internal Foundation',
      owner: 'Yonatan Orpeli',
      taskType: 'setup',
      estimatedMinutes: 60,
    },
  ];

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 border-red-200';
      case 2:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'High';
      case 2:
        return 'Medium';
      case 3:
        return 'Low';
      default:
        return 'Low';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'not_started':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };



  const isOverdue = (date: Date) => {
    return date < new Date() && !isToday(date);
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'today':
        return isToday(new Date(task.dueDate));
      case 'overdue':
        return isOverdue(new Date(task.dueDate));
      case 'upcoming':
        return new Date(task.dueDate) > new Date();
      default:
        return true;
    }
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    // Sort by priority first, then by due date
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <div className="text-sm text-gray-500">
          {filteredTasks.length} of {tasks.length}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'today', label: 'Today' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'upcoming', label: 'Upcoming' },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === filterOption.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 bg-white border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
              isOverdue(new Date(task.dueDate)) ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(task.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {task.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ml-2 flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.estimatedMinutes ? `${task.estimatedMinutes}m` : 'No estimate'}
                    </span>
                    <span>{task.phase}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {isOverdue(new Date(task.dueDate)) ? (
                      <span className="text-red-600 font-medium">Overdue</span>
                    ) : (
                      format(new Date(task.dueDate), 'MMM d')
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {sortedTasks.length === 0 && (
          <div className="text-center py-8">
            <Circle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No tasks match your search' : 'No tasks for this filter'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full text-center p-3 bg-primary-50 border border-primary-200 rounded-lg text-primary-700 hover:bg-primary-100 transition-colors">
          <Plus className="h-4 w-4 inline mr-2" />
          Add New Task
        </button>
      </div>
    </div>
  );
};

export default TaskList;
