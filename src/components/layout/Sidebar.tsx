import React, { useState } from 'react';
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
  Clock,
  ChevronLeft,
  ChevronRight,
  StickyNote
} from 'lucide-react';
import type { NavigationItem } from '../../lib/types';

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: 'BarChart3', current: false },
  { name: 'Daily Planner', href: '/daily-planner', icon: 'Clock', current: false },
  { name: 'Phases', href: '/phases', icon: 'Calendar', current: false },
  { name: 'Tasks', href: '/tasks', icon: 'CheckSquare', current: false },
  { name: 'Meetings', href: '/meetings', icon: 'Video', current: false },
  { name: 'Workstreams', href: '/workstreams', icon: 'Target', current: false },
  { name: 'Notes', href: '/notes', icon: 'StickyNote', current: false },
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
  StickyNote,
};

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Custom Tooltip Component
const Tooltip: React.FC<{ children: React.ReactNode; content: string; isVisible: boolean }> = ({ 
  children, 
  content, 
  isVisible 
}) => {
  if (!isVisible) return <>{children}</>;

  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {content}
        {/* Arrow pointing to the left */}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={20} /> : null;
  };

  return (
    <div className={`flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo and Toggle Button */}
      <div className="flex h-16 items-center px-3 border-b border-gray-200">
        <div className="flex items-center justify-between w-full">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VP</span>
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">
                Onboarding
              </span>
            </div>
          )}
          
          {/* Toggle Button */}
          <Tooltip content="Expand sidebar (Ctrl+B)" isVisible={isCollapsed}>
            <button
              onClick={onToggle}
              className={`p-1.5 rounded-md hover:bg-gray-100 hover:scale-105 transition-all duration-200 ${
                isCollapsed ? 'mx-auto' : 'ml-auto'
              }`}
            >
              {isCollapsed ? (
                <ChevronRight size={16} className="text-gray-600" />
              ) : (
                <ChevronLeft size={16} className="text-gray-600" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Tooltip key={item.name} content={item.name} isVisible={isCollapsed}>
              <Link
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <span className={`${
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                } ${!isCollapsed ? 'mr-3' : ''}`}>
                  {getIcon(item.icon)}
                </span>
                {!isCollapsed && item.name}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed ? (
          <div className="text-xs text-gray-500 text-center">
            VP Product Onboarding
            <br />
            Management Platform
          </div>
        ) : (
          <Tooltip content="VP Product Onboarding Management Platform" isVisible={true}>
            <div className="text-xs text-gray-500 text-center">
              VP
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
