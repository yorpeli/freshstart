import React from 'react';
import { Users } from 'lucide-react';
import type { Phase } from '../../../../../lib/types';

interface PhaseMeetingsProps {
  phase: Phase;
  className?: string;
}

const PhaseMeetings: React.FC<PhaseMeetingsProps> = ({ phase, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Users className="mx-auto mb-4 text-gray-400" size={48} />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Meetings Coming Soon</h3>
      <p className="text-gray-600">
        Meeting management for {phase.phase_name} will be available in a future update.
      </p>
    </div>
  );
};

export default PhaseMeetings;
