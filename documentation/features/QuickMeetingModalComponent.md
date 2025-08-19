# QuickMeetingModal Component

A reusable, compact modal component for displaying meeting information and providing quick actions. Designed to be used across the application wherever meeting objects are displayed.

## Features

- **Compact Design**: Small modal (max-width: 600px) for quick reference
- **Essential Information**: Meeting name, time, duration, attendees, status, location
- **Quick Actions**: Edit time, change status, view full details
- **Reusable**: Can be used in daily planner, meetings list, or any other meeting display
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Real-time Updates**: Database changes automatically refresh the UI via React Query

## Component Structure

```
QuickMeetingModal/
├── QuickMeetingModal.tsx          # Main modal component
├── components/
│   ├── QuickMeetingHeader.tsx     # Meeting name, time, duration, close button
│   ├── QuickMeetingAttendees.tsx  # Attendees list with roles
│   ├── QuickMeetingContext.tsx    # Status, location, phase, initiative
│   ├── QuickMeetingActions.tsx    # Quick action buttons
│   ├── TimeEditModal.tsx          # Modal for editing meeting time
│   └── StatusChangeModal.tsx      # Modal for changing meeting status
├── hooks/
│   └── useQuickMeetingModal.ts    # Custom hook for modal state management
├── types.ts                       # TypeScript interfaces
└── index.ts                       # Barrel exports
```

## Meeting Status System

The component supports four meeting statuses with appropriate visual styling:

### **Status Options:**

1. **`not_scheduled`** - Meeting needs to be scheduled but is not yet planned
   - Icon: Calendar
   - Color: Gray (`bg-gray-100 text-gray-800`)
   - Description: "Meeting needs to be scheduled but is not yet planned"

2. **`scheduled`** - Meeting is planned and confirmed
   - Icon: Clock
   - Color: Blue (`bg-blue-100 text-blue-800`)
   - Description: "Meeting is planned and confirmed"

3. **`completed`** - Meeting has finished
   - Icon: CheckCircle
   - Color: Green (`bg-green-100 text-green-800`)
   - Description: "Meeting has finished"

4. **`cancelled`** - Meeting has been cancelled
   - Icon: XCircle
   - Color: Red (`bg-red-100 text-red-800`)
   - Description: "Meeting has been cancelled"

### **Status Color Functions:**
All components that display meeting statuses use consistent color schemes:
- `QuickMeetingContext` - Status display in quick modal
- `MeetingRow` - Status in meeting lists
- `MeetingDetailModal` - Status in full meeting view
- `MeetingsList` - Status in meetings table

## Usage

### Basic Usage

```tsx
import { QuickMeetingModal, useQuickMeetingModal } from '../meetings/QuickMeetingModal';

const MyComponent = () => {
  const {
    isOpen,
    selectedMeeting,
    openModal,
    closeModal,
    handleEditTime,
    handleChangeStatus,
    handleViewFullDetails,
  } = useQuickMeetingModal(
    onEditTime,
    onChangeStatus,
    onViewFullDetails
  );

  return (
    <>
      <button onClick={() => openModal(meeting)}>
        View Meeting
      </button>

      <QuickMeetingModal
        isOpen={isOpen}
        onClose={closeModal}
        meeting={selectedMeeting}
        onEditTime={handleEditTime}
        onChangeStatus={handleChangeStatus}
        onViewFullDetails={handleViewFullDetails}
      />
    </>
  );
};
```

### With Database Integration

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

const MyComponent = () => {
  const queryClient = useQueryClient();

  // Database update function with React Query cache invalidation
  const updateMeeting = async (meetingId: number, updates: Partial<Meeting>) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update(updates)
        .eq('meeting_id', meetingId);

      if (error) throw error;

      // Invalidate and refetch meetings data to update the UI
      await queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
    } catch (error) {
      console.error('Failed to update meeting:', error);
      throw error;
    }
  };

  const handleEditTime = async (meetingId: number, newDate: Date, newDuration: number) => {
    try {
      await updateMeeting(meetingId, { 
        scheduled_date: newDate.toISOString(),
        duration_minutes: newDuration 
      });
      console.log('Meeting time updated successfully');
    } catch (error) {
      console.error('Failed to update meeting time:', error);
    }
  };

  const handleChangeStatus = async (meetingId: number, newStatus: string) => {
    try {
      await updateMeeting(meetingId, { status: newStatus });
      console.log('Meeting status updated successfully');
    } catch (error) {
      console.error('Failed to update meeting status:', error);
    }
  };

  const handleViewFullDetails = (meetingId: number) => {
    // Navigate to full meeting details
    navigate(`/meetings/${meetingId}`);
  };

  const {
    isOpen,
    selectedMeeting,
    openModal,
    closeModal,
    handleEditTime: modalHandleEditTime,
    handleChangeStatus: modalHandleChangeStatus,
    handleViewFullDetails: modalHandleViewFullDetails,
  } = useQuickMeetingModal(
    handleEditTime,
    handleChangeStatus,
    handleViewFullDetails
  );

  return (
    <QuickMeetingModal
      isOpen={isOpen}
      onClose={closeModal}
      meeting={selectedMeeting}
      onEditTime={modalHandleEditTime}
      onChangeStatus={modalHandleChangeStatus}
      onViewFullDetails={modalHandleViewFullDetails}
    />
  );
};
```

## Props

### QuickMeetingModal

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Function to close the modal |
| `meeting` | `Meeting \| null` | Yes | Meeting data to display |
| `onEditTime` | `(meetingId, newDate, newDuration) => void` | No | Handler for editing meeting time |
| `onChangeStatus` | `(meetingId, newStatus) => void` | No | Handler for changing meeting status |
| `onViewFullDetails` | `(meetingId) => void` | No | Handler for viewing full details |
| `className` | `string` | No | Additional CSS classes |

### useQuickMeetingModal Hook

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `onEditTime` | `(meetingId, newDate, newDuration) => void` | No | Handler for editing meeting time |
| `onChangeStatus` | `(meetingId, newStatus) => void` | No | Handler for changing meeting status |
| `onViewFullDetails` | `(meetingId) => void` | No | Handler for viewing full details |

**Returns:**
- `isOpen`: Modal visibility state
- `selectedMeeting`: Currently selected meeting
- `openModal`: Function to open modal with meeting data
- `closeModal`: Function to close modal
- `handleEditTime`: Handler for time editing
- `handleChangeStatus`: Handler for status changes
- `handleViewFullDetails`: Handler for viewing full details

## Integration Examples

### Daily Planner Integration

```tsx
// In TimeBlockedSchedule component
const handleMeetingClick = (meeting: Meeting) => {
  openModal(meeting);
};

// Add click handler to meeting blocks
<div
  className="meeting-block cursor-pointer"
  onClick={() => handleMeetingClick(meeting)}
>
  {/* Meeting content */}
</div>
```

### Meetings List Integration

```tsx
// In MeetingsList component
const handleRowClick = (meeting: Meeting) => {
  openModal(meeting);
};

// Add click handler to meeting rows
<tr onClick={() => handleRowClick(meeting)}>
  {/* Meeting row content */}
</tr>
```

### Complete Daily Planner Integration

```tsx
// TimeBlockedScheduleWithQuickModal.tsx
import { QuickMeetingModal, useQuickMeetingModal } from '../meetings/QuickMeetingModal';
import { useQueryClient } from '@tanstack/react-query';

const TimeBlockedScheduleWithQuickModal = ({ selectedDate, viewMode, viewRange }) => {
  const queryClient = useQueryClient();
  
  const {
    isOpen,
    selectedMeeting,
    openModal,
    closeModal,
    handleEditTime,
    handleChangeStatus,
    handleViewFullDetails,
  } = useQuickMeetingModal(
    async (meetingId, newDate, newDuration) => {
      // Database update logic
    },
    async (meetingId, newStatus) => {
      // Database update logic
    },
    (meetingId) => {
      // Navigation logic
    }
  );

  return (
    <>
      <TimeBlockedSchedule
        selectedDate={selectedDate}
        viewMode={viewMode}
        viewRange={viewRange}
        onMeetingClick={openModal}
      />

      <QuickMeetingModal
        isOpen={isOpen}
        onClose={closeModal}
        meeting={selectedMeeting}
        onEditTime={handleEditTime}
        onChangeStatus={handleChangeStatus}
        onViewFullDetails={handleViewFullDetails}
      />
    </>
  );
};
```

## Database Integration

### React Query Cache Management

The component automatically handles UI updates after database changes:

```tsx
// After successful database update
await queryClient.invalidateQueries({ queryKey: ['meetings'] });
```

This ensures:
- ✅ **Immediate UI updates** after status/time changes
- ✅ **No manual page refreshes** required
- ✅ **Consistent data** across all components
- ✅ **Real-time synchronization** with database

### Supported Database Operations

1. **Status Changes**: Update meeting status (not_scheduled, scheduled, completed, cancelled)
2. **Time Edits**: Modify meeting date, time, and duration
3. **Data Persistence**: All changes are saved to Supabase database
4. **Error Handling**: Graceful error handling with user feedback

## Styling

The component uses Tailwind CSS classes and follows the design system. Key styling features:

- **Responsive**: Adapts to different screen sizes
- **Consistent**: Follows the application's design patterns
- **Accessible**: High contrast and proper spacing
- **Interactive**: Hover states and focus indicators
- **Status-aware**: Different colors for each meeting status

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure
- Color contrast compliance
- Status-specific visual indicators

## Recent Updates

### v2.0 - Status System Overhaul
- ✅ **Added "Not Scheduled" status** for unscheduled meetings
- ✅ **Removed "In Progress" status** as requested
- ✅ **Updated all status color functions** across components
- ✅ **Enhanced database integration** with React Query cache invalidation
- ✅ **Improved error handling** and user feedback

### v1.0 - Initial Release
- ✅ **Core modal functionality** with compact design
- ✅ **Quick actions** for time and status editing
- ✅ **Reusable component architecture** following best practices
- ✅ **TypeScript interfaces** for type safety

## Future Enhancements

- **Drag & Drop**: For rescheduling meetings
- **Quick Notes**: Add quick notes without opening full modal
- **Meeting Templates**: Quick creation from templates
- **Integration**: Calendar app integration
- **Notifications**: Meeting reminders and updates
- **Bulk Operations**: Update multiple meetings at once
- **Status Workflows**: Automated status transitions based on rules
