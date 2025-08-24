import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

type ViewMode = '1day' | '3days' | 'week';

interface TaskDistributionHeaderProps {
  selectedDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const TaskDistributionHeader: React.FC<TaskDistributionHeaderProps> = ({
  selectedDate,
  viewMode,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday
}) => {
  const getViewModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case '1day':
        return '1 Day';
      case '3days':
        return '3 Days';
      case 'week':
        return '1 Week';
      default:
        return '3 Days';
    }
  };

  const getDateRangeLabel = () => {
    switch (viewMode) {
      case '1day':
        return format(selectedDate, 'MMMM d, yyyy');
      case '3days':
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 2);
        return `${format(selectedDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
      case 'week':
        const weekEndDate = new Date(selectedDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        return `${format(selectedDate, 'MMM d')} - ${format(weekEndDate, 'MMM d, yyyy')}`;
      default:
        return format(selectedDate, 'MMMM d, yyyy');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevious}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Previous period"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          
          <button
            onClick={onToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Today
          </button>
          
          <button
            onClick={onNext}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Next period"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Center - Date range display */}
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">
            {getDateRangeLabel()}
          </h1>
        </div>

        {/* Right side - View mode selector */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {(['1day', '3days', 'week'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getViewModeLabel(mode)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
