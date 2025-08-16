import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import type { TaskType } from '../../../../lib/types';

export const useTaskTypes = () => {
  return useQuery({
    queryKey: ['task_types', 'active'],
    queryFn: async (): Promise<TaskType[]> => {
      const { data, error } = await supabase
        .from('task_types')
        .select('*')
        .eq('is_active', true)
        .order('type_name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000
  });
};
