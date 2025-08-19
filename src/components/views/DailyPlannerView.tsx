import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon } from 'lucide-react';
import { TimeBlockedScheduleWithQuickModal, TaskList } from '../features/dailyPlanner';
import { format, addDays, subDays, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const DailyPlannerView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTaskPanelExpanded, setIsTaskPanelExpanded] = useState(true);
  const [viewMode, setViewMode] = useState<'1day' | '3days' | 'week'>('3days');

  console.log('DailyPlannerView - Current selectedDate:', selectedDate.toISOString());

  const goToPreviousDay = () => {
    if (viewMode === '1day') {
      setSelectedDate(prev => subDays(prev, 1));
    } else if (viewMode === '3days') {
      setSelectedDate(prev => subDays(prev, 3));
    } else if (viewMode === 'week') {
      setSelectedDate(prev => subDays(prev, 7));
    }
  };

  const goToNextDay = () => {
    if (viewMode === '1day') {
      setSelectedDate(prev => addDays(prev, 1));
    } else if (viewMode === '3days') {
      setSelectedDate(prev => addDays(prev, 3));
    } else if (viewMode === 'week') {
      setSelectedDate(prev => addDays(prev, 7));
    }
  };

  const goToToday = () => setSelectedDate(new Date());

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    }
    return format(date, 'EEE, MMM d');
  };

  const getViewRange = () => {
    if (viewMode === '1day') {
      return [selectedDate];
    } else if (viewMode === '3days') {
      return [
        selectedDate,
        addDays(selectedDate, 1),
        addDays(selectedDate, 2)
      ];
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday start
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    return [selectedDate];
  };

  const viewRange = getViewRange();
  console.log('DailyPlannerView - View range:', viewRange.map(d => d.toISOString()));

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Daily Planner</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToToday}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isToday(selectedDate)
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={goToNextDay}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  if (!isNaN(newDate.getTime())) {
                    setSelectedDate(newDate);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="text-lg font-medium text-gray-600">
              {formatDate(selectedDate)}
            </div>
            
            {/* View Mode Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: '1day', label: '1 Day' },
                { key: '3days', label: '3 Days' },
                { key: 'week', label: 'Week' }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === mode.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsTaskPanelExpanded(!isTaskPanelExpanded)}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                isTaskPanelExpanded
                  ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  : 'border-primary-300 text-primary-700 bg-primary-50 hover:bg-primary-100'
              }`}
              title={isTaskPanelExpanded ? 'Hide Tasks' : 'Show Tasks'}
            >
              {isTaskPanelExpanded ? (
                <ChevronRightIcon size={16} className="mr-1" />
              ) : (
                <ChevronLeftIcon size={16} className="mr-1" />
              )}
              {isTaskPanelExpanded ? 'Hide Tasks' : 'Show Tasks'}
            </button>
          </div>
        </div>
      </div>

             {/* Main Content */}
       <div className="flex-1 overflow-hidden">
         <div className="flex h-full">
           {/* Main Area - Time Blocked Schedule */}
           <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
             isTaskPanelExpanded ? 'mr-0' : 'mr-0'
           }`}>
             <TimeBlockedScheduleWithQuickModal 
               selectedDate={selectedDate} 
               viewMode={viewMode}
               viewRange={viewRange}
             />
           </div>

           {/* Collapsible Task Panel */}
           <div className={`relative transition-all duration-300 ${
             isTaskPanelExpanded ? 'w-96' : 'w-0'
           }`}>
             {isTaskPanelExpanded && (
               <div className="h-full border-l border-gray-200 overflow-y-auto">
                 <TaskList selectedDate={selectedDate} />
               </div>
             )}
             
             {/* Toggle Button */}
             <button
               onClick={() => setIsTaskPanelExpanded(!isTaskPanelExpanded)}
               className={`absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors ${
                 isTaskPanelExpanded ? 'hover:bg-gray-50' : 'hover:bg-primary-50'
               }`}
             >
               {isTaskPanelExpanded ? (
                 <ChevronRightIcon size={16} className="text-gray-600" />
               ) : (
                 <ChevronLeftIcon size={16} className="text-primary-600" />
               )}
             </button>
           </div>
         </div>
       </div>
    </div>
  );
};

export default DailyPlannerView;
