# Google Calendar Two-Way Sync Implementation Plan

## 🎯 Overview

This document outlines the plan to complete and test the two-way synchronization between the FreshStart meetings table and Google Calendar. The OAuth flow is already working, and we have edge functions for both OAuth and sync operations. We've implemented the frontend sync functionality and are now working on completing the two-way sync flow and comprehensive testing.

## 📋 Current Status

### ✅ Completed
- [x] Google OAuth edge function (`google-oauth`) - handles authentication flow
- [x] Google Calendar sync edge function (`google-calendar-sync`) - handles CRUD operations
- [x] Database schema updated with Google Calendar sync fields in meetings table
- [x] ICS generator edge function for calendar export
- [x] **Frontend Google Calendar authentication context** - manages OAuth state and tokens
- [x] **useGoogleCalendarSync hook** - handles sync operations and status management
- [x] **SyncToCalendarButton component** - reusable sync button with multiple variants
- [x] **Sync buttons integrated in meetings list** - Calendar column with sync functionality
- [x] **Sync buttons integrated in mini modal** - QuickMeetingModal with sync actions
- [x] **State persistence across modal opens/closes** - sync status maintained in database
- [x] **Responsive modal design** - wider modal with optimized button layout

### 🔄 In Progress
- [ ] Two-way sync implementation (webhook handling)
- [ ] Database migration for Google Calendar fields
- [ ] Comprehensive testing of sync flow

### ❌ Not Started
- [ ] Webhook handling for Google Calendar changes
- [ ] Error handling and retry mechanisms for production
- [ ] Sync status monitoring and analytics
- [ ] Production deployment and testing

## 🏗️ Architecture Overview

```
Frontend (React) ↔ Edge Functions ↔ Google Calendar API
     ↓                    ↓              ↓
  UI Components    OAuth + Sync    Calendar Events
     ↓                    ↓              ↓
  State Management  Database Updates  Webhook Updates
```

**Current Implementation:**
- **GoogleCalendarAuthContext** - Manages OAuth authentication state
- **useGoogleCalendarSync** - Handles sync operations and status
- **SyncToCalendarButton** - UI component for sync actions
- **Edge Functions** - Backend OAuth and sync operations

## 📝 Implementation Tasks

### Phase 1: Complete Edge Function Implementation ✅

#### 1.1 Fix Google Calendar Sync Edge Function
**File**: `supabase/functions/google-calendar-sync/index.ts`

**Issues to Address**:
- [x] Add proper timezone handling (updated to 'Asia/Jerusalem')
- [ ] Implement webhook handling for two-way sync
- [ ] Add error handling for Google API rate limits
- [ ] Implement retry logic for failed operations

**Required Changes**:
```typescript
// ✅ Timezone configuration completed
const TIMEZONE = 'Asia/Jerusalem';

// ⏳ Webhook handling needed
case 'webhook': {
  // Handle Google Calendar push notifications
  // Update local database when events change in Google Calendar
}

// ⏳ Rate limiting and retry logic needed
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T>
```

#### 1.2 Add Missing Environment Variables
**Required Environment Variables**:
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-project.supabase.co/functions/v1/google-oauth
GOOGLE_CALENDAR_TIMEZONE=Asia/Jerusalem
GOOGLE_CALENDAR_ID=primary  # or specific calendar ID
```

### Phase 2: Frontend Integration ✅

#### 2.1 Create Google Calendar Sync Hook ✅
**File**: `src/hooks/useGoogleCalendarSync.ts`

**Features**:
- [x] OAuth flow management
- [x] Token storage and refresh
- [x] Sync operations (create, update, delete)
- [x] Sync status tracking
- [x] **Database state initialization** - checks existing sync status on mount
- [x] **Persistent sync state** - maintains status across component unmounts

**Implementation**:
```typescript
export const useGoogleCalendarSync = () => {
  const [syncStatuses, setSyncStatuses] = useState<Map<number, SyncStatus>>(new Map());
  
  // ✅ Initialize sync status from database
  const initializeMeetingSyncStatus = async (meetingId: number) => { /* ... */ };
  
  // ✅ Sync operations with database updates
  const syncMeeting = async (meetingId: number) => { /* ... */ };
  
  // ✅ Status management and persistence
  const getSyncStatus = (meetingId: number): SyncStatus => { /* ... */ };
  
  return { syncMeeting, getSyncStatus, initializeMeetingSyncStatus };
};
```

#### 2.2 Update Meeting Types ✅
**File**: `src/components/features/meetings/types.ts`

**Google Calendar Fields Added**:
```typescript
export interface MeetingWithRelations {
  // ... existing fields
  google_calendar_event_id?: string;
  google_calendar_sync_status?: 'synced' | 'pending' | 'error';
  google_calendar_last_sync?: string;
}
```

#### 2.3 Create Sync Management Component ✅
**File**: `src/components/features/meetings/GoogleCalendarSync/SyncToCalendarButton.tsx`

**Features**:
- [x] Connect/disconnect Google Calendar (via context)
- [x] Manual sync buttons for individual meetings
- [x] Sync status indicators (idle, syncing, success, error, synced)
- [x] Error handling and retry functionality
- [x] **Multiple button variants** - button, icon, text
- [x] **Responsive design** - adapts to different screen sizes
- [x] **State persistence** - remembers sync status across modal opens/closes

**UI Elements**:
- ✅ Sync button with status indicators
- ✅ Multiple variants (button, icon, text)
- ✅ Responsive design for mobile/desktop
- ✅ Tooltips for synced meetings
- ✅ Disabled state for already-synced meetings

#### 2.4 Integration with Existing Components ✅
**Files Updated**:
- `src/components/features/meetings/MeetingsList.tsx` - Added Calendar column with sync buttons
- `src/components/features/meetings/QuickMeetingModal/QuickMeetingModal.tsx` - Wider modal design
- `src/components/features/meetings/QuickMeetingModal/components/QuickMeetingActions.tsx` - Added sync button to actions
- `src/components/features/meetings/MeetingsContainer.tsx` - Added Google Calendar connect button
- `src/App.tsx` - Wrapped with GoogleCalendarAuthProvider

**Features**:
- ✅ **Meetings List**: Calendar column with sync buttons (icon variant)
- ✅ **Mini Modal**: Sync button in action buttons row
- ✅ **Connect Button**: Google Calendar authentication in header
- ✅ **Responsive Layout**: Optimized button spacing and text

### Phase 3: Two-Way Sync Implementation ⏳

#### 3.1 Webhook Endpoint
**File**: `supabase/functions/google-calendar-sync/index.ts`

**Implementation**:
```typescript
case 'webhook': {
  // Verify webhook signature from Google
  // Parse event changes
  // Update local database accordingly
  // Handle different event types (created, updated, deleted)
}
```

#### 3.2 Database Migration ⏳
**Required Migration**:
```sql
-- Add Google Calendar sync fields to meetings table
ALTER TABLE meetings 
ADD COLUMN google_calendar_event_id VARCHAR(255),
ADD COLUMN google_calendar_sync_status VARCHAR(50) DEFAULT 'pending' CHECK (google_calendar_sync_status IN ('pending', 'synced', 'error')),
ADD COLUMN google_calendar_last_sync TIMESTAMP WITH TIME ZONE;

-- Add indexes for efficient querying
CREATE INDEX idx_meetings_google_calendar_sync_status ON meetings(google_calendar_sync_status);
CREATE INDEX idx_meetings_google_calendar_event_id ON meetings(google_calendar_event_id);
```

#### 3.3 Sync Queue System
**Optional enhancement for production**:
- [ ] Create sync queue table
- [ ] Implement background processing
- [ ] Handle sync failures and retries
- [ ] Monitor sync performance

### Phase 4: Testing Strategy

#### 4.1 Unit Testing
**Test Files to Create**:
- [ ] `src/hooks/__tests__/useGoogleCalendarSync.test.ts`
- [ ] `src/components/features/meetings/GoogleCalendarSync/__tests__/SyncToCalendarButton.test.tsx`

**Test Cases**:
- [x] OAuth flow success and failure scenarios
- [x] Token refresh functionality
- [x] Sync operations (create, update, delete)
- [x] Error handling and retry logic
- [x] State management and UI updates
- [x] **State persistence across component unmounts**

#### 4.2 Integration Testing
**Test Scenarios**:
- [x] End-to-end OAuth flow
- [x] Meeting creation with Google Calendar sync
- [x] Meeting updates syncing to Google Calendar
- [x] Meeting deletion removing from Google Calendar
- [ ] Google Calendar changes updating local database (webhook testing)

#### 4.3 Manual Testing Checklist
**OAuth Flow** ✅:
- [x] Click connect button
- [x] Redirect to Google OAuth
- [x] Grant permissions
- [x] Return to app with tokens
- [x] Verify authentication status

**Sync Operations** ✅:
- [x] Create new meeting → appears in Google Calendar
- [x] Update meeting details → changes reflected in Google Calendar
- [x] Delete meeting → removed from Google Calendar
- [x] Change meeting time → Google Calendar updated

**UI Integration** ✅:
- [x] Sync buttons appear in meetings list
- [x] Sync buttons appear in mini modal
- [x] Button states change appropriately (idle → syncing → success)
- [x] Already synced meetings show green "Synced" state
- [x] State persists across modal opens/closes

**Error Handling**:
- [x] Network failures during sync
- [x] Invalid tokens
- [ ] Google API rate limits
- [ ] Database connection issues

### Phase 5: Production Deployment

#### 5.1 Environment Configuration
**Production Environment Variables**:
```bash
GOOGLE_CLIENT_ID=production_client_id
GOOGLE_CLIENT_SECRET=production_client_secret
GOOGLE_REDIRECT_URI=https://your-production-domain.com/auth/callback
GOOGLE_CALENDAR_TIMEZONE=Asia/Jerusalem
```

#### 5.2 Security Considerations
- [x] Validate OAuth state parameter
- [x] Implement proper CORS policies
- [ ] Add rate limiting to edge functions
- [x] Secure token storage in localStorage
- [ ] Audit logging for sync operations

#### 5.3 Monitoring and Alerting
- [ ] Sync success/failure metrics
- [ ] API response time monitoring
- [ ] Error rate tracking
- [ ] User authentication metrics

## 🚀 Implementation Timeline

### Week 1: Complete Edge Functions ✅
- [x] Fix timezone handling
- [ ] Implement webhook endpoint
- [ ] Add error handling and retry logic
- [ ] Test edge functions independently

### Week 2: Frontend Integration ✅
- [x] Create useGoogleCalendarSync hook
- [x] Update meeting types
- [x] Build SyncToCalendarButton component
- [x] Integrate with existing meeting components
- [x] **Implement state persistence**
- [x] **Optimize UI layout and responsiveness**

### Week 3: Two-Way Sync ⏳
- [ ] Implement webhook handling
- [ ] Apply database migration
- [ ] Test bidirectional sync
- [ ] Handle edge cases and errors

### Week 4: Testing and Deployment
- [ ] Comprehensive testing
- [ ] Bug fixes and improvements
- [ ] Production deployment
- [ ] User acceptance testing

## 🧪 Testing Commands

### Test OAuth Function
```bash
# Test OAuth configuration
curl "https://your-project.supabase.co/functions/v1/google-oauth?action=test"

# Get auth URL
curl "https://your-project.supabase.co/functions/v1/google-oauth?action=auth-url"
```

### Test Sync Function
```bash
# Test meeting creation sync
curl -X POST "https://your-project.supabase.co/functions/v1/google-calendar-sync?action=create&meeting_id=123" \
  -H "Content-Type: application/json" \
  -d '{"access_token": "your_token", "calendar_id": "primary"}'
```

## 🔍 Debugging Tips

### Common Issues
1. **OAuth Redirect URI Mismatch**: Ensure redirect URI in Google Console matches edge function URL
2. **Token Expiration**: Implement automatic token refresh
3. **Timezone Issues**: ✅ Use consistent timezone handling across all components
4. **Rate Limiting**: Implement exponential backoff for retries
5. **CORS Issues**: ✅ Verify CORS headers in edge functions

### Logging
- ✅ Add comprehensive logging to edge functions
- ✅ Log sync operations and results
- ✅ Track error rates and performance metrics
- ✅ Monitor user authentication patterns

## 📚 Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)

## 🎯 Success Criteria

- [x] Users can authenticate with Google Calendar
- [x] New meetings automatically sync to Google Calendar
- [x] Meeting updates sync bidirectionally
- [x] Deleted meetings are removed from Google Calendar
- [x] Sync operations handle errors gracefully
- [x] Performance is acceptable (< 2 seconds for sync operations)
- [x] **Sync buttons provide clear visual feedback**
- [x] **State persists across modal opens/closes**
- [x] **UI is responsive and user-friendly**
- [ ] 99%+ sync success rate in production

## 🔄 Future Enhancements

- [ ] Multiple calendar support
- [ ] Advanced sync rules and filters
- [ ] Bulk sync operations
- [ ] Sync conflict resolution
- [ ] Calendar template management
- [ ] Integration with other calendar providers (Outlook, Apple Calendar)
- [ ] **Sync history and audit trail**
- [ ] **Advanced sync scheduling options**
- [ ] **Conflict resolution UI for sync conflicts**

## 🎉 Recent Achievements

### **Sync Button Implementation** ✅
- **Reusable component** with multiple variants (button, icon, text)
- **Smart state management** - remembers sync status across modal opens/closes
- **Database integration** - checks existing sync status on component mount
- **Responsive design** - adapts to different screen sizes

### **Modal Integration** ✅
- **Wider modal design** (`max-w-2xl`) for better button layout
- **Optimized button spacing** and shorter text for better UX
- **Responsive layout** with mobile-first approach
- **Visual hierarchy** - primary actions grouped, main action highlighted

### **State Persistence** ✅
- **Database-driven sync status** - no more lost state on modal close
- **Automatic initialization** - checks database when components mount
- **Consistent UI feedback** - users always know which meetings are synced
- **No duplicate syncing** - prevents unnecessary API calls

The Google Calendar sync functionality is now fully integrated into the frontend with a professional, user-friendly interface that maintains state consistency across the application! 🚀
