import { useState, useCallback } from 'react';
import type { WorkstreamType } from '../types';

interface DashboardFilters {
  timeRange: '1w' | '1m' | '3m';
  focusArea: WorkstreamType | 'all';
}

export const useDashboardFilters = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    timeRange: '1m',
    focusArea: 'all'
  });

  const updateTimeRange = useCallback((timeRange: '1w' | '1m' | '3m') => {
    setFilters(prev => ({ ...prev, timeRange }));
  }, []);

  const updateFocusArea = useCallback((focusArea: WorkstreamType | 'all') => {
    setFilters(prev => ({ ...prev, focusArea }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      timeRange: '1m',
      focusArea: 'all'
    });
  }, []);

  return {
    filters,
    updateTimeRange,
    updateFocusArea,
    resetFilters
  };
};

export default useDashboardFilters;