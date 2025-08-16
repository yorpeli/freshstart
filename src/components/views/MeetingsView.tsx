import React from 'react';
import ViewHeader from '../shared/ViewHeader';
import MeetingsContainer from '../features/meetings/MeetingsContainer';

const MeetingsView: React.FC = () => {
  return (
    <div className="flex-1 overflow-hidden">
      <ViewHeader 
        title="Meetings"
        description="Schedule and manage meetings with your team and stakeholders"
      />
      <MeetingsContainer />
    </div>
  );
};

export default MeetingsView;
