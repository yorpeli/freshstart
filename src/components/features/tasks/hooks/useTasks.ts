import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import type { TaskWithRelations } from '../types';

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'with-relations'],
    queryFn: async (): Promise<TaskWithRelations[]> => {
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
          ),
          task_workstreams (
            workstreams (
              workstream_id,
              workstream_name,
              color_code
            )
          )
        `)
        .order('phase_id', { ascending: true })
        .order('initiative_id', { ascending: true })
        .order('parent_task_id', { ascending: true, nullsFirst: true })
        .order('task_id', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to include computed fields
      const transformedData: TaskWithRelations[] = (data || []).map(task => ({
        ...task,
        task_type: task.task_types,
        owner_name: `${task.people?.first_name || ''} ${task.people?.last_name || ''}`.trim(),
        phase_name: task.phases?.phase_name || '',
        initiative_name: task.initiatives?.initiative_name || '',
        workstreams: task.task_workstreams?.map(tw => tw.workstreams).filter(Boolean) || []
      }));

      return transformedData;
    },
    staleTime: 5 * 60 * 1000
  });
};
