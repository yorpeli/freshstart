export interface MeetingWithRelations {
  meeting_id: number;
  meeting_name: string;
  meeting_type_id: number;
  scheduled_date: string;
  duration_minutes: number;
  location_platform: string;
  status: string;
  created_at: string;
  meeting_type?: {
    type_name: string;
  };
  phase?: {
    phase_id: number;
    phase_name: string;
    phase_number: number;
  };
  initiative?: {
    initiative_id: number;
    initiative_name: string;
  };
  workstreams?: Array<{
    workstream_id: number;
    workstream_name: string;
    color_code: string;
  }>;
  attendees?: Array<{
    name: string;
    role: string;
  }>;
  // Google Calendar sync fields
  google_calendar_event_id?: string;
  google_calendar_last_sync?: string;
}

export interface MeetingsFiltersState {
  searchQuery: string;
  statusFilter: string;
  phaseFilter: string;
  workstreamFilter: string;
  dateFilter: string;
  sortBy: 'scheduled_date' | 'meeting_name' | 'duration_minutes' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface MeetingsFiltersProps {
  filters: MeetingsFiltersState;
  phases: Array<{ phase_id: number; phase_name: string; phase_number: number }>;
  workstreams: Array<{ workstream_id: number; workstream_name: string; color_code: string }>;
  onFiltersChange: (filters: Partial<MeetingsFiltersState>) => void;
}
