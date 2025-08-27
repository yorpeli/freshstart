import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay } from 'date-fns';

export interface Meeting {
  meeting_id: number;
  meeting_name: string;
  scheduled_date: string;
  duration_minutes: number;
  status: string;
  location_platform: string;
  meeting_type: string;
  phase_name: string;
  initiative_name: string;
  workstreams: Array<{
    workstream_id: number;
    workstream_name: string;
    color_code: string;
  }>;
  attendees: string[];
  // Google Calendar sync fields
  google_calendar_event_id?: string;
  google_calendar_last_sync?: string;
}

export const useMeetings = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['meetings', startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<Meeting[]> => {
      const start = startOfDay(startDate).toISOString();
      const end = endOfDay(endDate).toISOString();

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          meeting_id,
          meeting_name,
          scheduled_date,
          duration_minutes,
          status,
          location_platform,
          meeting_types!inner(type_name),
          phases!inner(phase_name),
          initiatives!inner(initiative_name),
          meeting_workstreams(
            workstreams(
              workstream_id,
              workstream_name,
              color_code
            )
          ),
          meeting_attendees(
            people!inner(first_name, last_name)
          )
        `)
        .gte('scheduled_date', start)
        .lte('scheduled_date', end)
        .order('scheduled_date', { ascending: true });

      if (error) {
        throw new Error(`Error fetching meetings: ${error.message}`);
      }

      // Transform the data to match our interface
      return (data || []).map((meeting: any) => ({
        meeting_id: meeting.meeting_id,
        meeting_name: meeting.meeting_name,
        scheduled_date: meeting.scheduled_date,
        duration_minutes: meeting.duration_minutes,
        status: meeting.status,
        location_platform: meeting.location_platform,
        meeting_type: meeting.meeting_types?.type_name || '',
        phase_name: meeting.phases?.phase_name || '',
        initiative_name: meeting.initiatives?.initiative_name || '',
        workstreams: meeting.meeting_workstreams?.map((mw: any) => mw.workstreams).filter(Boolean) || [],
        attendees: meeting.meeting_attendees?.map((attendee: any) => 
          `${attendee.people?.first_name || ''} ${attendee.people?.last_name || ''}`.trim()
        ).filter(Boolean) || [],
        // Google Calendar fields - will be added after database migration
        google_calendar_event_id: undefined,
        google_calendar_last_sync: undefined,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
