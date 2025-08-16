import React from 'react';
import { useSinglePhase } from '../../../../hooks/useSupabaseQuery';
import LoadingState from '../../../shared/LoadingState';
import ErrorState from '../../../shared/ErrorState';
import EmptyState from '../../../shared/EmptyState';
import { Target } from 'lucide-react';
import SinglePhaseDetails from './SinglePhaseDetails';

interface SinglePhaseContainerProps {
  phaseId: string;
  className?: string;
}

const SinglePhaseContainer: React.FC<SinglePhaseContainerProps> = ({ 
  phaseId, 
  className = '' 
}) => {
  const { data: phase, isLoading, error } = useSinglePhase(phaseId);

  if (isLoading) {
    return <LoadingState className={className} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        title="Error Loading Phase"
        className={className}
      />
    );
  }

  if (!phase) {
    return (
      <EmptyState
        title="Phase Not Found"
        description="The requested phase could not be found. It may have been deleted or you may not have permission to view it."
        icon={<Target size={48} className="mx-auto" />}
        className={className}
      />
    );
  }

  return <SinglePhaseDetails phase={phase} className={className} />;
};

export default SinglePhaseContainer;
