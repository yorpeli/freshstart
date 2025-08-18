import React from 'react';
import PhaseMetadata from './PhaseMetadata';
import PhaseMilestones from './PhaseMilestones';
import PhaseDescription from './PhaseDescription';
import PhaseCheckpoints from './PhaseCheckpoints';
import PhaseOutcomes from './PhaseOutcomes';
import type { Phase } from '../../../../../lib/types';

interface PhaseOverviewProps {
  phase: Phase;
  className?: string;
}

const PhaseOverview: React.FC<PhaseOverviewProps> = ({ 
  phase, 
  className = '' 
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Phase Metadata and Key Milestones - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseMetadata phase={phase} />
        <PhaseMilestones phase={phase} />
      </div>
      
      {/* Description and Success Criteria */}
      <PhaseDescription phase={phase} />

      {/* Checkpoints and Phase Outcomes - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhaseCheckpoints phase={phase} />
        <PhaseOutcomes phase={phase} />
      </div>
    </div>
  );
};

export default PhaseOverview;
