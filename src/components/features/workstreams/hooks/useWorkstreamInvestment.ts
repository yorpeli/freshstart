import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';

export interface WorkstreamInvestmentData {
  week: string;
  weekStart: Date;
  workstreams: {
    [workstreamName: string]: number;
  };
  totalMeetings: number;
}

export interface Workstream {
  workstream_id: number;
  workstream_name: string;
  color_code: string;
}

export const useWorkstreamInvestment = () => {
  return useQuery({
    queryKey: ['workstream-investment'],
    queryFn: async (): Promise<WorkstreamInvestmentData[]> => {
      // First, get all workstreams
      const { data: workstreams, error: workstreamsError } = await supabase
        .from('workstreams')
        .select('workstream_id, workstream_name, color_code')
        .order('workstream_name');

      if (workstreamsError) {
        throw new Error(`Error fetching workstreams: ${workstreamsError.message}`);
      }

      // Get all meetings with their workstreams
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select(`
          meeting_id,
          scheduled_date,
          meeting_workstreams!inner(
            workstream_id
          )
        `)
        .order('scheduled_date');

      if (meetingsError) {
        throw new Error(`Error fetching meetings: ${meetingsError.message}`);
      }

      // Create a map of workstream names for easy lookup
      const workstreamMap = new Map(
        workstreams.map(w => [w.workstream_id, w.workstream_name])
      );

      // Group meetings by week
      const weeklyData = new Map<string, WorkstreamInvestmentData>();

      meetings.forEach((meeting: any) => {
        const meetingDate = parseISO(meeting.scheduled_date);
        const weekStart = startOfWeek(meetingDate, { weekStartsOn: 1 }); // Monday start
        const weekKey = format(weekStart, 'yyyy-MM-dd');

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, {
            week: weekKey,
            weekStart,
            workstreams: {},
            totalMeetings: 0
          });
        }

        const weekData = weeklyData.get(weekKey)!;
        weekData.totalMeetings++;

        // Count workstreams for this meeting
        meeting.meeting_workstreams.forEach((mw: any) => {
          const workstreamName = workstreamMap.get(mw.workstream_id);
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
