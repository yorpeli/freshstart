import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { startOfWeek, format, parseISO } from 'date-fns';

export interface TaskInvestmentData {
  week: string;
  weekStart: Date;
  workstreams: {
    [workstreamName: string]: number;
  };
  totalTasks: number;
}

export const useTaskInvestment = () => {
  return useQuery({
    queryKey: ['task-investment'],
    queryFn: async (): Promise<TaskInvestmentData[]> => {
      // First, get all workstreams
      const { data: workstreams, error: workstreamsError } = await supabase
        .from('workstreams')
        .select('workstream_id, workstream_name, color_code')
        .order('workstream_name');

      if (workstreamsError) {
        throw new Error(`Error fetching workstreams: ${workstreamsError.message}`);
      }

      // Get all tasks with their workstreams and due dates
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          task_id,
          due_date,
          task_workstreams!inner(
            workstream_id
          )
        `)
        .not('due_date', 'is', null)
        .order('due_date');

      if (tasksError) {
        throw new Error(`Error fetching tasks: ${tasksError.message}`);
      }

      // Create a map of workstream names for easy lookup
      const workstreamMap = new Map(
        workstreams.map(w => [w.workstream_id, w.workstream_name])
      );

      // Group tasks by week
      const weeklyData = new Map<string, TaskInvestmentData>();

      tasks.forEach((task: any) => {
        const taskDate = parseISO(task.due_date);
        const weekStart = startOfWeek(taskDate, { weekStartsOn: 1 }); // Monday start
        const weekKey = format(weekStart, 'yyyy-MM-dd');

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, {
            week: weekKey,
            weekStart,
            workstreams: {},
            totalTasks: 0
          });
        }

        const weekData = weeklyData.get(weekKey)!;
        weekData.totalTasks++;

        // Count workstreams for this task
        task.task_workstreams.forEach((tw: any) => {
          const workstreamName = workstreamMap.get(tw.workstream_id);
          if (workstreamName) {
            weekData.workstreams[workstreamName] = 
              (weekData.workstreams[workstreamName] || 0) + 1;
          }
        });
      });

      // Convert to array and sort by date
      return Array.from(weeklyData.values())
        .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
