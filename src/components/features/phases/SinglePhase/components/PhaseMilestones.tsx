import React from 'react';
import { Milestone, Calendar, Star } from 'lucide-react';
import Card from '../../../../ui/Card';
import Badge from '../../../../ui/Badge';
import type { Phase } from '../../../../../lib/types';

interface PhaseMilestonesProps {
  phase: Phase;
  className?: string;
}

const PhaseMilestones: React.FC<PhaseMilestonesProps> = ({ phase, className = '' }) => {
  // Early return if no milestones
  if (!phase.key_milestones || typeof phase.key_milestones !== 'object') {
    return null;
  }

  const milestones = phase.key_milestones;
  
  // Check if we have any milestone data
  const milestoneEntries = Object.entries(milestones);
  if (milestoneEntries.length === 0) {
    return null;
  }

  const getCriticalityColor = (criticality: string) => {
    switch (criticality?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Milestone size={20} className="text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Key Milestones</h2>
        </div>

        <div className="space-y-4">
          {milestoneEntries.map(([key, milestone]: [string, any]) => (
            <div 
              key={key} 
              className={`border rounded-lg p-4 hover:border-purple-300 transition-colors ${getCriticalityColor(milestone.criticality)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {milestone.criticality === 'high' && (
                    <Star size={16} className="text-red-500 fill-current" />
                  )}
                  <h3 className="font-medium text-gray-900">{milestone.milestone}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {milestone.day && (
                    <Badge variant="outline" className="text-xs">
                      Day {milestone.day}
                    </Badge>
                  )}
                  {milestone.criticality && (
                    <Badge 
                      variant={milestone.criticality === 'high' ? 'error' : 
                               milestone.criticality === 'medium' ? 'warning' : 'success'}
                      className="text-xs"
                    >
                      {milestone.criticality}
                    </Badge>
                  )}
                </div>
              </div>
              
              {milestone.description && (
                <p className="text-gray-700 text-sm mt-2">{milestone.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PhaseMilestones;
