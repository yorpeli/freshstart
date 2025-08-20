import React from 'react';
import MeetingsContainer from '../features/meetings/MeetingsContainer';

const MeetingsView: React.FC = () => {
  return (
    <div className="flex-1 overflow-hidden">
      <MeetingsContainer />
    </div>
  );
};

export default MeetingsView;
