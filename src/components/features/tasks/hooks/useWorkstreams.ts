import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';

export interface Workstream {
  workstream_id: number;
  workstream_name: string;
  color_code: string | null;
}

export const useWorkstreams = () => {
  return useQuery({
    queryKey: ['workstreams'],
    queryFn: async (): Promise<Workstream[]> => {
      const { data, error } = await supabase
        .from('workstreams')
        .select('workstream_id, workstream_name, color_code')
        .order('workstream_name');

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
};
