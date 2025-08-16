import PhaseCard from './PhaseCard';
import type { Phase } from '../../../lib/types';

interface PhasesListProps {
  phases: Phase[];
  className?: string;
}

const PhasesList: React.FC<PhasesListProps> = ({ phases, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {phases.map((phase) => (
        <PhaseCard key={phase.phase_id} phase={phase} />
      ))}
    </div>
  );
};

export default PhasesList;