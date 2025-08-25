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
  attendees?: Array<{
    name: string;
    role: string;
  }>;
  // Google Calendar sync fields
  google_calendar_event_id?: string;
  google_calendar_sync_status?: 'synced' | 'pending' | 'error';
  google_calendar_last_sync?: string;
}

export interface MeetingsFiltersState {
  searchQuery: string;
  statusFilter: string;
  meetingTypeFilter: string;
  dateFilter: string;
  sortBy: 'scheduled_date' | 'meeting_name' | 'duration_minutes' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface MeetingsFiltersProps {
  filters: MeetingsFiltersState;
  meetingTypes: Array<{ meeting_type_id: number; type_name: string }>;
  onFiltersChange: (filters: Partial<MeetingsFiltersState>) => void;
}
