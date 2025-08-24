import React from 'react';
import Card from '../../../ui/Card';

const WorkstreamsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <div className="bg-gray-200 h-6 rounded mb-4"></div>
        <div className="bg-gray-200 h-4 rounded w-3/4 mb-4"></div>
        <div className="bg-gray-200 h-20 rounded mb-4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
      </Card>
    ))}
  </div>
);

export default WorkstreamsSkeleton;