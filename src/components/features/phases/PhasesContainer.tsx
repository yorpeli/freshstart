import { Target } from 'lucide-react';
import { usePhases } from '../../../hooks/useSupabaseQuery';
import LoadingState from '../../shared/LoadingState';
import ErrorState from '../../shared/ErrorState';
import EmptyState from '../../shared/EmptyState';
import PhasesList from './PhasesList';

interface PhasesContainerProps {
  className?: string;
}

const PhasesContainer: React.FC<PhasesContainerProps> = ({ className = '' }) => {
  const { data: phases, isLoading, error } = usePhases();

  if (isLoading) {
    return <LoadingState className={className} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        title="Error Loading Phases"
        className={className}
      />
    );
  }

  if (!phases || phases.length === 0) {
    return (
      <EmptyState
        title="No Phases Found"
        description="Get started by creating your first onboarding phase."
        icon={<Target size={48} className="mx-auto" />}
        className={className}
      />
    );
  }

  return <PhasesList phases={phases} className={className} />;
};

export default PhasesContainer;