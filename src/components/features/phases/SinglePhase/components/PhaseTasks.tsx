import React from 'react';
import { ClipboardList } from 'lucide-react';
import type { Phase } from '../../../../../lib/types';

interface PhaseTasksProps {
  phase: Phase;
  className?: string;
}

const PhaseTasks: React.FC<PhaseTasksProps> = ({ phase, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <ClipboardList className="mx-auto mb-4 text-gray-400" size={48} />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks Coming Soon</h3>
      <p className="text-gray-600">
        Task management for {phase.phase_name} will be available in a future update.
      </p>
    </div>
  );
};

export default PhaseTasks;
