import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { format, isToday, isSameDay, parseISO } from 'date-fns';

export interface DailyOverviewData {
  totalTasks: number;
  completedTasks: number;
  totalMeetings: number;
  focusTime: number; // hours
  priorities: Array<{
    id: number;
    text: string;
    priority: string;
    phase: string;
  }>;
  phaseProgress: Array<{
    name: string;
    progress: number;
    color: string;
  }>;
}

export const useDailyOverview = (selectedDate: Date) => {
  return useQuery({
    queryKey: ['daily-overview', selectedDate.toISOString().split('T')[0]],
    queryFn: async (): Promise<DailyOverviewData> => {
      // Fetch tasks for the selected date
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          phases (phase_name),
          initiatives (initiative_name)
        `)
        .gte('due_date', format(selectedDate, 'yyyy-MM-dd'))
        .lte('due_date', format(selectedDate, 'yyyy-MM-dd'));

      if (tasksError) {
        throw new Error(tasksError.message);
      }

      // Fetch meetings for the selected date
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .gte('start_time', format(selectedDate, 'yyyy-MM-dd'))
        .lt('start_time', format(addDays(selectedDate, 1), 'yyyy-MM-dd'));

      if (meetingsError) {
        throw new Error(meetingsError.message);
      }

      // Calculate task statistics
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'completed').length || 0;

      // Calculate meeting statistics
      const totalMeetings = meetings?.length || 0;

      // Calculate focus time (estimated task duration in hours)
      const focusTime = Math.round((tasks?.reduce((total, task) => {
        // For now, we'll estimate based on priority since estimated duration isn't stored
        const estimatedMinutes = task.priority === 1 ? 120 : task.priority === 2 ? 60 : 30;
        return total + estimatedMinutes;
      }, 0) || 0) / 60);

      // Get top priorities (high priority tasks)
      const priorities = (tasks || [])
        .filter(task => task.priority === 1)
        .slice(0, 3)
        .map((task, index) => ({
          id: task.task_id,
          text: task.task_name,
          priority: 'high',
          phase: task.phases?.phase_name || '',
        }));

      // Get phase progress (simplified for now)
      const phaseProgress = [
        { name: 'Foundation', progress: 65, color: 'bg-blue-500' },
        { name: 'Discovery', progress: 30, color: 'bg-green-500' },
        { name: 'Implementation', progress: 0, color: 'bg-yellow-500' },
      ];

      return {
        totalTasks,
        completedTasks,
        totalMeetings,
        focusTime,
        priorities,
        phaseProgress,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper function to add days
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
