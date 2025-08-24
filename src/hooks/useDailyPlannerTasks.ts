import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { TaskWithRelations } from '../components/features/tasks/types';
import { format, isToday, isSameDay, parseISO } from 'date-fns';

export interface DailyPlannerTask {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  priority: number;
  status: string;
  phase: string;
  initiative: string;
  owner: string;
  taskType: string;
  estimatedMinutes?: number;
  updatedAt: string;
}

export const useDailyPlannerTasks = (selectedDate: Date) => {
  return useQuery({
    queryKey: ['daily-planner-tasks', selectedDate.toISOString().split('T')[0]],
    queryFn: async (): Promise<DailyPlannerTask[]> => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_types (
            task_type_id,
            type_name,
            description,
            color_code,
            icon
          ),
          people!tasks_owner_id_fkey (
            person_id,
            first_name,
            last_name
          ),
          phases (
            phase_id,
            phase_name
          ),
          initiatives (
            initiative_id,
            initiative_name
          )
        `)
        .order('priority', { ascending: true, nullsLast: true })
        .order('due_date', { ascending: true, nullsLast: true });

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to match the daily planner format
      const transformedData: DailyPlannerTask[] = (data || [])
        .map(task => ({
          id: task.task_id,
          name: task.task_name,
          description: task.description || '',
          dueDate: task.due_date || '',
          priority: task.priority || 3, // Default to low priority if null
          status: task.status,
          phase: task.phases?.phase_name || '',
          initiative: task.initiatives?.initiative_name || '',
          owner: `${task.people?.first_name || ''} ${task.people?.last_name || ''}`.trim(),
          taskType: task.task_types?.type_name || '',
          estimatedMinutes: undefined, // Not currently stored in DB
          updatedAt: task.updated_at
        }))
        .filter(task => {
          // For completed tasks, show them on the day they were completed
          if (task.status === 'completed') {
            if (!task.updatedAt) return false;
            const completionDate = parseISO(task.updatedAt);
            return isSameDay(completionDate, selectedDate);
          }
          
          // For non-completed tasks, use the existing logic
          if (!task.dueDate) return false;
          
          const taskDate = parseISO(task.dueDate);
          
          // Show tasks that are:
          // 1. Due on the selected date
          // 2. Due today (regardless of selected date)
          // 3. Overdue (for context)
          return isSameDay(taskDate, selectedDate) || 
                 isToday(taskDate) || 
                 taskDate < new Date();
        });

      return transformedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a single task with all relations for the detail modal
export const useTaskDetail = (taskId: number | null) => {
  return useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: async () => {
      if (!taskId) return null;

      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_types (
            task_type_id,
            type_name,
            description,
            color_code,
            icon
          ),
          people!tasks_owner_id_fkey (
            person_id,
            first_name,
            last_name
          ),
          phases (
            phase_id,
            phase_name
          ),
          initiatives (
            initiative_id,
            initiative_name
          )
        `)
        .eq('task_id', taskId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Transform to match TaskWithRelations interface
      return {
        ...data,
        task_type: data.task_types,
        owner_name: `${data.people?.first_name || ''} ${data.people?.last_name || ''}`.trim(),
        phase_name: data.phases?.phase_name || '',
        initiative_name: data.initiatives?.initiative_name || ''
      };
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};