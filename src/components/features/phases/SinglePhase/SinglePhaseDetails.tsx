import React from 'react';
import PhaseTabs from './components/PhaseTabs';
import type { Phase } from '../../../../lib/types';

interface SinglePhaseDetailsProps {
  phase: Phase;
  className?: string;
}

const SinglePhaseDetails: React.FC<SinglePhaseDetailsProps> = ({ 
  phase, 
  className = '' 
}) => {
  return <PhaseTabs phase={phase} className={className} />;
};

export default SinglePhaseDetails;
