import { useWorkstreamInvestment } from './useWorkstreamInvestment';
import { useTaskInvestment } from './useTaskInvestment';

export interface WorkstreamDistributionData {
  workstreamName: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DistributionSummary {
  meetings: WorkstreamDistributionData[];
  tasks: WorkstreamDistributionData[];
  combined: WorkstreamDistributionData[];
  totalMeetings: number;
  totalTasks: number;
  totalCombined: number;
}

// Define colors for workstreams (consistent with other charts)
const workstreamColors: { [key: string]: string } = {
  'Product': '#3B82F6',
  'Process': '#10B981',
  'People': '#F59E0B',
  'Partnerships': '#EF4444'
};

export const useWorkstreamDistribution = (): {
  data: DistributionSummary | null;
  isLoading: boolean;
  error: Error | null;
} => {
  const { data: meetingData, isLoading: meetingsLoading, error: meetingsError } = useWorkstreamInvestment();
  const { data: taskData, isLoading: tasksLoading, error: tasksError } = useTaskInvestment();

  const isLoading = meetingsLoading || tasksLoading;
  const error = meetingsError || tasksError;

  if (isLoading || error || !meetingData || !taskData) {
    return { data: null, isLoading, error };
  }

  // Calculate total counts for meetings
  const meetingTotals = new Map<string, number>();
  let totalMeetingCount = 0;

  meetingData.forEach(week => {
    Object.entries(week.workstreams).forEach(([workstream, count]) => {
      meetingTotals.set(workstream, (meetingTotals.get(workstream) || 0) + count);
      totalMeetingCount += count;
    });
  });

  // Calculate total counts for tasks
  const taskTotals = new Map<string, number>();
  let totalTaskCount = 0;

  taskData.forEach(week => {
    Object.entries(week.workstreams).forEach(([workstream, count]) => {
      taskTotals.set(workstream, (taskTotals.get(workstream) || 0) + count);
      totalTaskCount += count;
    });
  });

  // Get all unique workstream names
  const allWorkstreams = new Set([
    ...Array.from(meetingTotals.keys()),
    ...Array.from(taskTotals.keys())
  ]);

  // Create distribution data for meetings
  const meetingsDistribution: WorkstreamDistributionData[] = Array.from(allWorkstreams)
    .map(workstream => {
      const count = meetingTotals.get(workstream) || 0;
      return {
        workstreamName: workstream,
        count,
        percentage: totalMeetingCount > 0 ? (count / totalMeetingCount) * 100 : 0,
        color: workstreamColors[workstream] || '#6B7280'
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  // Create distribution data for tasks
  const tasksDistribution: WorkstreamDistributionData[] = Array.from(allWorkstreams)
    .map(workstream => {
      const count = taskTotals.get(workstream) || 0;
      return {
        workstreamName: workstream,
        count,
        percentage: totalTaskCount > 0 ? (count / totalTaskCount) * 100 : 0,
        color: workstreamColors[workstream] || '#6B7280'
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  // Create combined distribution data
  const combinedTotals = new Map<string, number>();
  let totalCombinedCount = 0;

  Array.from(allWorkstreams).forEach(workstream => {
    const meetingCount = meetingTotals.get(workstream) || 0;
    const taskCount = taskTotals.get(workstream) || 0;
    const combinedCount = meetingCount + taskCount;
    
    if (combinedCount > 0) {
      combinedTotals.set(workstream, combinedCount);
      totalCombinedCount += combinedCount;
    }
  });

  const combinedDistribution: WorkstreamDistributionData[] = Array.from(combinedTotals.entries())
    .map(([workstream, count]) => ({
      workstreamName: workstream,
      count,
      percentage: totalCombinedCount > 0 ? (count / totalCombinedCount) * 100 : 0,
      color: workstreamColors[workstream] || '#6B7280'
    }))
    .sort((a, b) => b.count - a.count);

  return {
    data: {
      meetings: meetingsDistribution,
      tasks: tasksDistribution,
      combined: combinedDistribution,
      totalMeetings: totalMeetingCount,
      totalTasks: totalTaskCount,
      totalCombined: totalCombinedCount
    },
    isLoading: false,
    error: null
  };
};
