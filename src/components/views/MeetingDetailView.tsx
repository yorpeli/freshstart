import React from 'react';
import { useParams } from 'react-router-dom';
import MeetingPageContainer from '../features/meetings/MeetingPage/MeetingPageContainer';
import ErrorBoundary from '../ui/ErrorBoundary';

const MeetingDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Meeting Not Found</h1>
          <p className="text-gray-600">The meeting ID is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MeetingPageContainer meetingId={parseInt(id, 10)} />
    </ErrorBoundary>
  );
};

export default MeetingDetailView;