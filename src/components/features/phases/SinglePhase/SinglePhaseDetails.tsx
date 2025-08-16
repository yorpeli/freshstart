import React from 'react';
import PhaseMetadata from './components/PhaseMetadata';
import PhaseProgress from './components/PhaseProgress';
import PhaseDescription from './components/PhaseDescription';
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
      {/* Phase Metadata */}
      <PhaseMetadata phase={phase} />
      
      {/* Progress Overview */}
      <PhaseProgress phase={phase} />
      
      {/* Description and Success Criteria */}
      <PhaseDescription phase={phase} />
    </div>
  );
};

export default SinglePhaseDetails;
