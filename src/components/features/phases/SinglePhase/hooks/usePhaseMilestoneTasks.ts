import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../../lib/supabase';
import type { Task } from '../../../../../lib/types';

export const usePhaseMilestoneTasks = (phaseId: string | undefined) => {
  return useQuery({
    queryKey: ['phase-milestone-tasks', phaseId],
    queryFn: async (): Promise<Task[]> => {
      if (!phaseId) return [];
      
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
          )
        `)
        .eq('phase_id', phaseId)
        .eq('task_type_id', 9) // Phase Milestone
        .order('due_date', { ascending: true })
        .order('task_id', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!phaseId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
