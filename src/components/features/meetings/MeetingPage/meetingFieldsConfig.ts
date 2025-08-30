export interface MeetingFieldConfig {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
  backgroundColor: string;
  borderColor: string;
  minHeight: string;
  databaseField: keyof MeetingFields;
}

export interface MeetingFields {
  meeting_objectives: string | null;
  key_messages: string | null;
  unstructured_notes: string | null;
  meeting_summary: string | null;
  overall_assessment: string | null;
}

export const MEETING_FIELDS_CONFIG: MeetingFieldConfig[] = [
  {
    key: 'objectives',
    label: 'Meeting Objectives',
    icon: '🎯',
    placeholder: 'Define clear objectives for this meeting... What do you want to achieve?',
    backgroundColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    minHeight: '6rem',
    databaseField: 'meeting_objectives'
  },
  {
    key: 'keyMessages',
    label: 'Key Messages',
    icon: '💬',
    placeholder: 'What key messages do you want to communicate during this meeting?',
    backgroundColor: 'bg-green-50',
    borderColor: 'border-green-100',
    minHeight: '6rem',
    databaseField: 'key_messages'
  },
  {
    key: 'notes',
    label: 'Pre-Meeting Notes',
    icon: '📝',
    placeholder: 'Add your pre-meeting notes, thoughts, and preparation here... Use @mentions for people, #tags for tasks, and ! for meetings.',
    backgroundColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    minHeight: '8rem',
    databaseField: 'unstructured_notes'
  },
  {
    key: 'summary',
    label: 'Meeting Summary',
    icon: '📋',
    placeholder: 'Capture key points, decisions, and action items from the meeting...',
    backgroundColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    minHeight: '8rem',
    databaseField: 'meeting_summary'
  },
  {
    key: 'assessment',
    label: 'Overall Assessment',
    icon: '🔮',
    placeholder: 'Future-facing analysis, insights, and strategic considerations from this meeting...',
    backgroundColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    minHeight: '8rem',
    databaseField: 'overall_assessment'
  }
];

// Layout configuration for the grid
export const FIELD_LAYOUT = {
  topRow: ['objectives', 'keyMessages'],
  middleRow: ['notes', 'summary'],
  bottomRow: ['assessment']
};
