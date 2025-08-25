import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import MeetingsList from './MeetingsList';
import { CreateMeetingModal } from './CreateMeetingModal';
import { useGoogleCalendarAuth } from '../../../contexts/GoogleCalendarAuthContext';

const MeetingsContainer: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAuthenticated, authenticate, logout } = useGoogleCalendarAuth();

  // Debug logging
  console.log('MeetingsContainer - Auth state:', { isAuthenticated });

  const handleMeetingCreated = () => {
    // Trigger a refresh of the meetings list
    setRefreshKey(prev => prev + 1);
    console.log('Meeting created successfully - refreshing list');
  };

  const handleGoogleCalendarAuth = async () => {
    try {
      console.log('Attempting to authenticate with Google Calendar...');
      await authenticate();
      console.log('Authentication completed');
    } catch (error) {
      console.error('Failed to authenticate with Google Calendar:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Meetings</h2>
          <p className="text-gray-600 mt-1">
            Manage your scheduled meetings and create new ones
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Google Calendar Connect Button */}
          <button
            onClick={isAuthenticated ? logout : handleGoogleCalendarAuth}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              isAuthenticated
                ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
            }`}
            title={isAuthenticated ? 'Disconnect Google Calendar' : 'Connect Google Calendar'}
          >
            <Calendar size={20} />
            {isAuthenticated ? 'Connected' : 'Connect Calendar'}
          </button>
          
          {/* Create Meeting Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Create Meeting
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <MeetingsList key={refreshKey} />

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  );
};

export default MeetingsContainer;
