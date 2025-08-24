import React, { useState, useMemo } from 'react';
import { format, addDays, eachDayOfInterval, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import { TaskDayView } from './TaskDayView';
import { TaskDistributionHeader } from './TaskDistributionHeader';
import { LoadingState, ErrorState, EmptyState } from '../../../shared';
import type { TaskWithRelations } from '../types';

type ViewMode = '1day' | '3days' | 'week';

interface TaskDistributionViewProps {
  initialDate?: Date;
  onTaskClick?: (task: TaskWithRelations) => void;
}

export const TaskDistributionView: React.FC<TaskDistributionViewProps> = ({
  initialDate = new Date(),
  onTaskClick
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>('3days');

  // Fetch tasks data
  const { data: tasks, isLoading, error } = useTasks();

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const start = selectedDate;
    let end: Date;

    switch (viewMode) {
      case '1day':
        end = selectedDate;
        break;
      case '3days':
        end = addDays(selectedDate, 2);
        break;
      case 'week':
        // For week view, always start with Sunday and end with Saturday
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 }); // 0 = Sunday
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 }); // 0 = Sunday
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      default:
        end = addDays(selectedDate, 2);
    }

    return eachDayOfInterval({ start, end });
  }, [selectedDate, viewMode]);

  // Filter and sort tasks for the date range
  const tasksByDate = useMemo(() => {
    if (!tasks) return {};

    const tasksMap: Record<string, TaskWithRelations[]> = {};

    dateRange.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      tasksMap[dateKey] = [];
    });

    tasks.forEach(task => {
      // Check if task is due on any of the dates in our range
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const dateKey = format(dueDate, 'yyyy-MM-dd');
        
        if (tasksMap[dateKey]) {
          tasksMap[dateKey].push(task);
        }
      }
    });

    // Sort tasks by priority (high to low) within each date
    Object.keys(tasksMap).forEach(dateKey => {
      tasksMap[dateKey].sort((a, b) => {
        const priorityA = a.priority || 0;
        const priorityB = b.priority || 0;
        return priorityB - priorityA; // High priority first
      });
    });

    return tasksMap;
  }, [tasks, dateRange]);

  // Navigation handlers
  const goToPrevious = () => {
    let newDate: Date;
    switch (viewMode) {
      case '1day':
        newDate = addDays(selectedDate, -1);
        break;
      case '3days':
        newDate = addDays(selectedDate, -3);
        break;
      case 'week':
        newDate = addDays(selectedDate, -7);
        break;
      default:
        newDate = addDays(selectedDate, -3);
    }
    setSelectedDate(newDate);
  };

  const goToNext = () => {
    let newDate: Date;
    switch (viewMode) {
      case '1day':
        newDate = addDays(selectedDate, 1);
        break;
      case '3days':
        newDate = addDays(selectedDate, 3);
        break;
      case 'week':
        newDate = addDays(selectedDate, 7);
        break;
      default:
        newDate = addDays(selectedDate, 3);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error as Error} title="Error loading tasks" />;
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return <EmptyState 
      title="No tasks found" 
      description="There are no tasks available to display in the distribution view." 
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation and view controls */}
      <TaskDistributionHeader
        selectedDate={selectedDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
      />

      {/* Task distribution grid */}
      <div className="grid gap-4" style={{
        gridTemplateColumns: viewMode === '1day' ? '1fr' : 
                           viewMode === '3days' ? 'repeat(3, 1fr)' : 
                           'repeat(7, 1fr)'
      }}>
        {dateRange.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateKey] || [];
          
          return (
            <TaskDayView
              key={dateKey}
              date={date}
              tasks={dayTasks}
              isToday={isToday(date)}
              onTaskClick={onTaskClick}
            />
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(tasksByDate).flat().length}
            </div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {Object.values(tasksByDate).flat().filter(t => t.priority === 3).length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(tasksByDate).flat().filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};
