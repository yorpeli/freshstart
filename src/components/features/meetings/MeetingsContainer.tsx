import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import MeetingsList from './MeetingsList';
import { CreateMeetingModal } from './CreateMeetingModal';

const MeetingsContainer: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMeetingCreated = () => {
    // Trigger a refresh of the meetings list
    setRefreshKey(prev => prev + 1);
    console.log('Meeting created successfully - refreshing list');
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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Meeting
        </button>
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
