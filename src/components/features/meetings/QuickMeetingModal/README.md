# QuickMeetingModal Component

A reusable, compact modal component for displaying meeting information and providing quick actions. Designed to be used across the application wherever meeting objects are displayed.

## Features

- **Compact Design**: Small modal (max-width: 600px) for quick reference
- **Essential Information**: Meeting name, time, duration, attendees, status, location
- **Quick Actions**: Edit time, change status, view full details
- **Reusable**: Can be used in daily planner, meetings list, or any other meeting display
- **Accessible**: Proper ARIA labels and keyboard navigation

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

### With Custom Handlers

```tsx
const MyComponent = () => {
  const handleEditTime = async (meetingId: number, newDate: Date, newDuration: number) => {
    try {
      await updateMeeting(meetingId, {
        scheduled_date: newDate.toISOString(),
        duration_minutes: newDuration
      });
      // Refresh data or show success message
    } catch (error) {
      // Handle error
    }
  };

  const handleChangeStatus = async (meetingId: number, newStatus: string) => {
    try {
      await updateMeeting(meetingId, { status: newStatus });
      // Refresh data or show success message
    } catch (error) {
      // Handle error
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

## Styling

The component uses Tailwind CSS classes and follows the design system. Key styling features:

- **Responsive**: Adapts to different screen sizes
- **Consistent**: Follows the application's design patterns
- **Accessible**: High contrast and proper spacing
- **Interactive**: Hover states and focus indicators

## Accessibility

- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Semantic HTML structure
- Color contrast compliance

## Future Enhancements

- **Drag & Drop**: For rescheduling meetings
- **Quick Notes**: Add quick notes without opening full modal
- **Meeting Templates**: Quick creation from templates
- **Integration**: Calendar app integration
- **Notifications**: Meeting reminders and updates
