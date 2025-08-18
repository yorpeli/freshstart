import React from 'react';
import { Target, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { format, isToday } from 'date-fns';

interface DailyOverviewProps {
  selectedDate: Date;
}

const DailyOverview: React.FC<DailyOverviewProps> = ({ selectedDate }) => {
  // Mock data - will be replaced with real data from Supabase
  const dailyStats = {
    totalTasks: 8,
    completedTasks: 3,
    totalMeetings: 4,
    focusTime: 6, // hours
  };

  const priorities = [
    { id: 1, text: 'Review Q3 OKRs', priority: 'high', phase: 'Foundation' },
    { id: 2, text: 'Legal Deep Dive Meeting', priority: 'high', phase: 'Foundation' },
    { id: 3, text: 'Systems Access Setup', priority: 'medium', phase: 'Foundation' },
  ];

  const phaseProgress = [
    { name: 'Foundation', progress: 65, color: 'bg-blue-500' },
    { name: 'Discovery', progress: 30, color: 'bg-green-500' },
    { name: 'Implementation', progress: 0, color: 'bg-yellow-500' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Date Header */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">
          {format(selectedDate, 'd')}
        </div>
        <div className="text-sm text-gray-500">
          {format(selectedDate, 'MMM yyyy')}
        </div>
        {isToday(selectedDate) && (
          <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            Today
          </div>
        )}
      </div>

      {/* Daily Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Today's Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div className="ml-2">
                <div className="text-lg font-semibold text-blue-900">{dailyStats.completedTasks}/{dailyStats.totalTasks}</div>
                <div className="text-xs text-blue-600">Tasks</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-purple-600" />
              <div className="ml-2">
                <div className="text-lg font-semibold text-purple-900">{dailyStats.totalMeetings}</div>
                <div className="text-xs text-purple-600">Meetings</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-green-600" />
            <div className="ml-2">
              <div className="text-lg font-semibold text-green-900">{dailyStats.focusTime}h</div>
              <div className="text-xs text-green-600">Focus Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Priorities */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Today's Priorities</h3>
        <div className="space-y-2">
          {priorities.map((priority) => (
            <div key={priority.id} className="p-3 bg-white border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{priority.text}</div>
                  <div className="text-xs text-gray-500 mt-1">{priority.phase}</div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority.priority)}`}>
                  {priority.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Phase Progress</h3>
        <div className="space-y-3">
          {phaseProgress.map((phase) => (
            <div key={phase.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{phase.name}</span>
                <span className="text-sm text-gray-500">{phase.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${phase.color}`}
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Review Weekly Goals</span>
            </div>
          </button>
          <button className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Schedule Focus Time</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyOverview;
