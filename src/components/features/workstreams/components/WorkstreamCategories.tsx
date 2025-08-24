import React from 'react';
import Card from '../../../ui/Card';
import type { WorkstreamCategoriesProps } from '../types';

const categories = [
  {
    name: 'Product',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    subtextColor: 'text-blue-600',
    description: 'Product strategy and development'
  },
  {
    name: 'Process',
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    subtextColor: 'text-green-600',
    description: 'Operational processes and workflows'
  },
  {
    name: 'People',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    subtextColor: 'text-amber-600',
    description: 'Team building and management'
  },
  {
    name: 'Partnerships',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    subtextColor: 'text-purple-600',
    description: 'External relationships and alliances'
  }
];

const WorkstreamCategories: React.FC<WorkstreamCategoriesProps> = ({ 
  className = '' 
}) => (
  <Card className={className}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Workstream Categories</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => (
        <div 
          key={category.name}
          className={`flex items-center space-x-3 p-3 ${category.bgColor} rounded-lg`}
        >
          <div className={`w-3 h-3 ${category.color} rounded-full`} />
          <span className={`text-sm font-medium ${category.textColor}`}>
            {category.name}
          </span>
          <span className={`text-xs ${category.subtextColor}`}>
            {category.description}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

export default WorkstreamCategories;