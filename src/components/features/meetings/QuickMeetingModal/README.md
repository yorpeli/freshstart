# QuickMeetingModal Component

A modal component for quickly viewing and editing meeting details with a streamlined single edit mode.

## Features

- **Single Edit Mode**: One edit button enables editing for all fields simultaneously
- **Quick Actions**: Download ICS, sync with Google Calendar, view full details
- **Responsive Design**: Works on both desktop and mobile devices
- **Real-time Updates**: Changes are saved immediately when user approves

## Component Structure

```
QuickMeetingModal/
├── QuickMeetingModal.tsx          # Main modal component
├── types.ts                       # TypeScript interfaces
├── index.ts                       # Exports
├── components/
│   ├── QuickMeetingHeader.tsx     # Meeting name, date, time, duration
│   ├── QuickMeetingContext.tsx    # Status, location, phase, initiative, workstreams
│   ├── QuickMeetingAttendees.tsx  # Attendees list
│   └── QuickMeetingActions.tsx    # Action buttons (save/cancel when editing)
└── README.md                      # This file
```

## Usage

```tsx
import { QuickMeetingModal } from '../meetings/QuickMeetingModal';
import type { MeetingEditForm } from '../meetings/QuickMeetingModal/types';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const handleSave = async (meetingId: number, updatedData: Partial<MeetingEditForm>) => {
    try {
      // Update meeting in database
      await updateMeeting(meetingId, updatedData);
      console.log('Meeting updated successfully');
    } catch (error) {
      console.error('Failed to update meeting:', error);
    }
  };

  const handleViewFullDetails = (meetingId: number) => {
    navigate(`/meetings/${meetingId}`);
  };

  return (
    <QuickMeetingModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      meeting={selectedMeeting}
      onSave={handleSave}
      onViewFullDetails={handleViewFullDetails}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Handler for closing the modal |
| `meeting` | `Meeting \| null` | Yes | Meeting data to display/edit |
| `onSave` | `(meetingId: number, updatedData: Partial<MeetingEditForm>) => void` | No | Handler for saving meeting changes |
| `onViewFullDetails` | `(meetingId: number) => void` | No | Handler for viewing full meeting details |
| `onDownloadICS` | `(meetingId: number) => void` | No | Handler for downloading ICS file |
| `className` | `string` | No | Additional CSS classes |

## Edit Mode

The modal features a single edit mode that enables editing for all fields simultaneously:

1. **Edit Button**: Click the edit icon in the header to enter edit mode
2. **Field Editing**: All editable fields become interactive inputs/selects
3. **Save/Cancel**: Use the save (✓) or cancel (✗) buttons to confirm or discard changes
4. **Auto-reset**: Form automatically resets to original values when canceling

## Editable Fields

- **Meeting Name**: Text input
- **Date & Time**: Date and time inputs
- **Duration**: Dropdown with preset options (15, 30, 45, 60, 90, 120 min)
- **Status**: Dropdown (not_scheduled, scheduled, completed, cancelled)
- **Location/Platform**: Text input
- **Initiative**: Dropdown with available initiatives
- **Workstreams**: Checkboxes for multiple selection

## Data Flow

1. **View Mode**: Display meeting information in read-only format
2. **Edit Mode**: Show form inputs with current values
3. **Save**: Call `onSave` with meeting ID and changed fields
4. **Success**: Exit edit mode and refresh data
5. **Error**: Show error message and stay in edit mode

## Styling

The component uses Tailwind CSS classes and follows the design system:
- **Primary Colors**: Blue for edit button, green for save, red for cancel
- **Hover States**: Subtle color changes on interactive elements
- **Responsive**: Adapts to different screen sizes
- **Consistent**: Matches the overall application design

## Integration

The component integrates with:
- **Supabase**: For data persistence
- **React Query**: For data fetching and caching
- **React Router**: For navigation to full meeting details
- **Google Calendar**: For calendar synchronization
