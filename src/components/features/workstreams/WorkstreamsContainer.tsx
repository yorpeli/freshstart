import React from 'react';
import { useWorkstreams } from '../../../hooks/useSupabaseQuery';
import WorkstreamsSkeleton from './components/WorkstreamsSkeleton';
import WorkstreamsError from './components/WorkstreamsError';
import WorkstreamsEmpty from './components/WorkstreamsEmpty';
import WorkstreamGrid from './components/WorkstreamGrid';
import type { WorkstreamsContainerProps } from './types';

const WorkstreamsContainer: React.FC<WorkstreamsContainerProps> = ({ 
  className = '' 
}) => {
  const { data: workstreams, isLoading, error } = useWorkstreams();

  const safeWorkstreams = workstreams || [];

  if (isLoading) {
    return <WorkstreamsSkeleton />;
  }

  if (error) {
    return (
      <WorkstreamsError 
        error={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (safeWorkstreams.length === 0) {
    return <WorkstreamsEmpty />;
  }

  return (
    <WorkstreamGrid 
      workstreams={safeWorkstreams} 
      className={className}
    />
  );
};

export default WorkstreamsContainer;