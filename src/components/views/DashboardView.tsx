
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { usePhases, useWorkstreams, usePeople, useDepartments } from '../../hooks/useSupabaseQuery';
import { priorityColors } from '../../lib/types';
import { testSupabaseConnection } from '../../lib/supabase';
import { useEffect } from 'react';
import { 
  Calendar, 
  Target, 
  Users, 
  Building2, 
 
  Clock 
} from 'lucide-react';

const DashboardView: React.FC = () => {
  const { data: phases, isLoading: phasesLoading } = usePhases();
  const { data: workstreams, isLoading: workstreamsLoading } = useWorkstreams();
  const { data: people, isLoading: peopleLoading } = usePeople();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

  // Test Supabase connection on component mount
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const isLoading = phasesLoading || workstreamsLoading || peopleLoading || departmentsLoading;

  const stats = [
    {
      name: 'Total Phases',
      value: phases?.length || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Workstreams',
      value: workstreams?.length || 0,
      icon: Target,
      color: 'bg-green-500',
      change: '+1',
      changeType: 'positive' as const,
    },
    {
      name: 'Team Members',
      value: people?.length || 0,
      icon: Users,
      color: 'bg-amber-500',
      change: '+3',
      changeType: 'positive' as const,
    },
    {
      name: 'Departments',
      value: departments?.length || 0,
      icon: Building2,
      color: 'bg-purple-500',
      change: '0',
      changeType: 'neutral' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="bg-gray-200 h-20 rounded mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-6 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-gray-600">
          Here's what's happening with your VP Product onboarding project today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.name} className="hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">from last week</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent size={24} className="text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Progress Overview</h3>
          <div className="space-y-4">
            {phases?.slice(0, 3).map((phase) => (
              <div key={phase.phase_id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{phase.phase_name}</span>
                  <span className="text-sm text-gray-500">
                    {Math.round((phase.learning_percentage + phase.value_percentage) / 2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.round((phase.learning_percentage + phase.value_percentage) / 2)}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Learning: {phase.learning_percentage}%</span>
                  <span>Value: {phase.value_percentage}%</span>
                </div>
              </div>
            ))}
            {phases && phases.length > 3 && (
              <div className="text-center pt-2">
                <span className="text-sm text-gray-500">
                  +{phases.length - 3} more phases
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workstream Status</h3>
          <div className="space-y-3">
            {workstreams?.map((workstream) => (
              <div key={workstream.workstream_id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                                  <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: workstream.color || '#6b7280' }}
                ></div>
                <span className="text-sm text-gray-700">{workstream.workstream_name}</span>
              </div>
              <Badge 
                className={`text-xs ${workstream.priority ? priorityColors[workstream.priority as keyof typeof priorityColors] : 'bg-gray-100 text-gray-800'}`}
              >
                {workstream.priority === 1 ? 'Low' : workstream.priority === 2 ? 'Medium' : workstream.priority === 3 ? 'High' : 'Unknown'}
              </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Phase 2 completed successfully</span>
              <span className="text-xs text-gray-400 ml-auto">2h ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New team member added to Product workstream</span>
              <span className="text-xs text-gray-400 ml-auto">4h ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Meeting scheduled for Q4 Integration phase</span>
              <span className="text-xs text-gray-400 ml-auto">1d ago</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-red-500" />
                <span className="text-sm font-medium text-red-700">Strategic Positioning Review</span>
              </div>
              <span className="text-xs text-red-600 font-medium">Due today</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">Team Alignment Meeting</span>
              </div>
              <span className="text-xs text-yellow-600 font-medium">Due tomorrow</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Process Documentation</span>
              </div>
              <span className="text-xs text-blue-600 font-medium">Due in 3 days</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
