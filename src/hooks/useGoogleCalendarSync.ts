import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGoogleCalendarAuth } from '../contexts/GoogleCalendarAuthContext';

interface SyncStatus {
  meetingId: number;
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  googleEventId?: string;
}

export const useGoogleCalendarSync = () => {
  const [syncStatuses, setSyncStatuses] = useState<Map<number, SyncStatus>>(new Map());
  const { isAuthenticated, accessToken, authenticate } = useGoogleCalendarAuth();

  // Initialize sync status for a meeting based on database state
  const initializeMeetingSyncStatus = useCallback(async (meetingId: number) => {
    try {
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('google_calendar_event_id')
        .eq('meeting_id', meetingId)
        .single();

      if (error) {
        console.error('Error fetching meeting sync status:', error);
        return;
      }

      // If meeting is already synced, set the status accordingly
      if (meeting?.google_calendar_event_id) {
        setSyncStatuses(prev => new Map(prev).set(meetingId, {
          meetingId,
          status: 'success',
          message: 'Already synced to Google Calendar',
          googleEventId: meeting.google_calendar_event_id
        }));
      }
    } catch (error) {
      console.error('Error initializing meeting sync status:', error);
    }
  }, []);

  // Sync a single meeting to Google Calendar
  const syncMeeting = useCallback(async (meetingId: number) => {
    // Check if user is authenticated
    if (!isAuthenticated || !accessToken) {
      // Try to authenticate first
      try {
        await authenticate();
        // After authentication, the user will need to click sync again
        return;
      } catch (error) {
        console.error('Authentication failed:', error);
        throw new Error('Please authenticate with Google Calendar first');
      }
    }

    // Update status to syncing
    setSyncStatuses(prev => new Map(prev).set(meetingId, {
      meetingId,
      status: 'syncing',
      message: 'Syncing to Google Calendar...'
    }));

    try {
      // Get the meeting data
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          meeting_id,
          meeting_name,
          scheduled_date,
          duration_minutes,
          location_platform,
          meeting_objectives,
          key_messages,
          meeting_attendees (
            person_id,
            role_in_meeting,
            people (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('meeting_id', meetingId)
        .single();

      if (meetingError || !meeting) {
        throw new Error('Meeting not found');
      }

      // Call the Google Calendar sync edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/google-calendar-sync?action=create&meeting_id=${meetingId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            access_token: accessToken,
            calendar_id: 'primary'
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync to Google Calendar');
      }

      const result = await response.json();

      // Update the meeting with the Google Calendar event ID
      if (result.google_event_id) {
        await supabase
          .from('meetings')
          .update({ 
            google_calendar_event_id: result.google_event_id,
            updated_at: new Date().toISOString()
          })
          .eq('meeting_id', meetingId);
      }

      // Update status to success
      setSyncStatuses(prev => new Map(prev).set(meetingId, {
        meetingId,
        status: 'success',
        message: 'Successfully synced to Google Calendar',
        googleEventId: result.google_event_id
      }));

      return result;

    } catch (error) {
      console.error('Sync error:', error);
      
      // Update status to error
      setSyncStatuses(prev => new Map(prev).set(meetingId, {
        meetingId,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to sync to Google Calendar'
      }));

      throw error;
    }
  }, [isAuthenticated, accessToken, authenticate]);

  // Get sync status for a specific meeting
  const getSyncStatus = useCallback((meetingId: number): SyncStatus => {
    return syncStatuses.get(meetingId) || {
      meetingId,
      status: 'idle'
    };
  }, [syncStatuses]);

  // Clear sync status for a meeting
  const clearSyncStatus = useCallback((meetingId: number) => {
    setSyncStatuses(prev => {
      const newMap = new Map(prev);
      newMap.delete(meetingId);
      return newMap;
    });
  }, []);

  // Check if a meeting is already synced
  const isMeetingSynced = useCallback((meetingId: number): boolean => {
    const status = syncStatuses.get(meetingId);
    return status?.status === 'success' && !!status.googleEventId;
  }, [syncStatuses]);

  return {
    syncMeeting,
    getSyncStatus,
    clearSyncStatus,
    isMeetingSynced,
    isAuthenticated,
    initializeMeetingSyncStatus
  };
};
