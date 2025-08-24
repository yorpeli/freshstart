import React from 'react';
import WorkstreamCard from './WorkstreamCard';
import type { WorkstreamGridProps } from '../types';

const WorkstreamGrid: React.FC<WorkstreamGridProps> = ({ 
  workstreams, 
  className = '' 
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
    {workstreams.map((workstream) => (
      <WorkstreamCard 
        key={workstream.workstream_id} 
        workstream={workstream} 
      />
    ))}
  </div>
);

export default WorkstreamGrid;