import React from 'react';
import PhaseMetadata from './components/PhaseMetadata';
import PhaseProgress from './components/PhaseProgress';
import PhaseDescription from './components/PhaseDescription';
import PhaseCheckpoints from './components/PhaseCheckpoints';
import PhaseMilestones from './components/PhaseMilestones';
import PhaseOutcomes from './components/PhaseOutcomes';
import type { Phase } from '../../../../lib/types';

interface SinglePhaseDetailsProps {
  phase: Phase;
  className?: string;
}

const SinglePhaseDetails: React.FC<SinglePhaseDetailsProps> = ({ 
  phase, 
  className = '' 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Phase Metadata and Progress Overview - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseMetadata phase={phase} />
        <PhaseProgress phase={phase} />
      </div>
      
      {/* Description and Success Criteria */}
      <PhaseDescription phase={phase} />

      {/* Checkpoints and Milestones - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseCheckpoints phase={phase} />
        <PhaseMilestones phase={phase} />
      </div>

      {/* Phase Outcomes - Full Width */}
      <PhaseOutcomes phase={phase} />
    </div>
  );
};

export default SinglePhaseDetails;
