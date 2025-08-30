import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseRealTimeUpdatesOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
}

export const useRealTimeUpdates = (options: UseRealTimeUpdatesOptions = {}) => {
  const { interval = 5 * 60 * 1000, enabled = true } = options; // Default 5 minutes
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout>();

  const invalidateQueries = useCallback(() => {
    // Invalidate executive dashboard data
    queryClient.invalidateQueries({ queryKey: ['executive-dashboard'] });
    
    // Invalidate core data queries
    queryClient.invalidateQueries({ queryKey: ['phases'] });
    queryClient.invalidateQueries({ queryKey: ['workstreams'] });
    queryClient.invalidateQueries({ queryKey: ['people'] });
    
    console.log('Dashboard data refreshed at', new Date().toLocaleTimeString());
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) return;

    // Set up interval for real-time updates
    intervalRef.current = setInterval(invalidateQueries, interval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled, invalidateQueries]);

  // Manual refresh function
  const refresh = () => {
    invalidateQueries();
  };

  return {
    refresh,
    isEnabled: enabled,
    interval
  };
};

export default useRealTimeUpdates;