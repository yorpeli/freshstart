import { useMemo } from 'react';
import { priorityColors } from '../../../../lib/types';
import type { WorkstreamPriority } from '../types';

interface PriorityDisplayData {
  label: string;
  colorClass: string;
  iconName: string;
  iconColor: string;
  borderColor: string;
}

export const useWorkstreamPriority = (priority: number | null): PriorityDisplayData => {
  return useMemo((): PriorityDisplayData => {
    if (!priority) {
      return {
        label: 'Unknown',
        colorClass: 'bg-gray-100 text-gray-800',
        iconName: 'Target',
        iconColor: 'text-gray-500',
        borderColor: 'border-l-gray-500',
      };
    }

    const validPriority = priority as WorkstreamPriority;

    switch (validPriority) {
      case 1: // Low priority
        return {
          label: 'Low',
          colorClass: priorityColors[1],
          iconName: 'CheckCircle',
          iconColor: 'text-green-500',
          borderColor: 'border-l-green-500',
        };
      case 2: // Medium priority
        return {
          label: 'Medium',
          colorClass: priorityColors[2],
          iconName: 'Clock',
          iconColor: 'text-yellow-500',
          borderColor: 'border-l-yellow-500',
        };
      case 3: // High priority
        return {
          label: 'High',
          colorClass: priorityColors[3],
          iconName: 'AlertCircle',
          iconColor: 'text-red-500',
          borderColor: 'border-l-red-500',
        };
      default:
        return {
          label: 'Unknown',
          colorClass: 'bg-gray-100 text-gray-800',
          iconName: 'Target',
          iconColor: 'text-gray-500',
          borderColor: 'border-l-gray-500',
        };
    }
  }, [priority]);
};