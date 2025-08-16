import React from 'react';
import { useParams } from 'react-router-dom';
import { SinglePhaseContainer } from '../features/phases/SinglePhase';
import PhaseBackButton from '../features/phases/SinglePhase/components/PhaseBackButton';

const SinglePhaseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Phase</h1>
          <p className="text-gray-600 mb-4">No phase ID provided in the URL.</p>
          <PhaseBackButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Navigation */}
      <div className="mb-6">
        <PhaseBackButton />
      </div>

      {/* Phase Content */}
      <SinglePhaseContainer phaseId={id} />
    </div>
  );
};

export default SinglePhaseView;
