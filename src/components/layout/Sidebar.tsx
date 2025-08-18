import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Target, 
  Users, 
  Building2, 
  CalendarDays,
  BarChart3,
  CheckSquare,
  Video,
  Clock
} from 'lucide-react';
import type { NavigationItem } from '../../lib/types';

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: 'BarChart3', current: false },
  { name: 'Daily Planner', href: '/daily-planner', icon: 'Clock', current: false },
  { name: 'Phases', href: '/phases', icon: 'Calendar', current: false },
  { name: 'Tasks', href: '/tasks', icon: 'CheckSquare', current: false },
  { name: 'Meetings', href: '/meetings', icon: 'Video', current: false },
  { name: 'Workstreams', href: '/workstreams', icon: 'Target', current: false },
  { name: 'People', href: '/people', icon: 'Users', current: false },
  { name: 'Departments', href: '/departments', icon: 'Building2', current: false },
  { name: 'Meeting Types', href: '/meeting-types', icon: 'CalendarDays', current: false },
];

const iconMap = {
  BarChart3,
  Calendar,
  CheckSquare,
  Target,
  Users,
  Building2,
  CalendarDays,
  Video,
  Clock,
};

const Sidebar: React.FC = () => {
  const location = useLocation();

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">VP</span>
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-900">
            Onboarding
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-3 ${
                isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
              }`}>
                {getIcon(item.icon)}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 text-center">
          VP Product Onboarding
          <br />
          Management Platform
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
