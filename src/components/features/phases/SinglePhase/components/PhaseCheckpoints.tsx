import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import Card from '../../../../ui/Card';
import Badge from '../../../../ui/Badge';
import type { Phase } from '../../../../../lib/types';

interface PhaseCheckpointsProps {
  phase: Phase;
  className?: string;
}

const PhaseCheckpoints: React.FC<PhaseCheckpointsProps> = ({ phase, className = '' }) => {
  // Early return if no checkpoints
  if (!phase.success_checkpoints || typeof phase.success_checkpoints !== 'object') {
    return null;
  }

  const checkpoints = phase.success_checkpoints;
  
  // Check if we have any checkpoint categories with data
  const hasData = Object.values(checkpoints).some(
    (category: any) => Array.isArray(category) && category.length > 0
  );
  
  if (!hasData) {
    return null;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'decision_goals': return '🎯';
      case 'knowledge_goals': return '🧠';
      case 'deliverable_goals': return '📋';
      case 'relationship_goals': return '🤝';
      default: return '✓';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'decision_goals': return 'Decision Goals';
      case 'knowledge_goals': return 'Knowledge Goals';
      case 'deliverable_goals': return 'Deliverable Goals';
      case 'relationship_goals': return 'Relationship Goals';
      default: return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <CheckSquare size={20} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Success Checkpoints</h2>
        </div>

        <div className="space-y-6">
          {Object.entries(checkpoints).map(([category, goals]: [string, any]) => {
            if (!Array.isArray(goals) || goals.length === 0) return null;
            
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <h3 className="text-lg font-medium text-gray-900">{getCategoryTitle(category)}</h3>
                </div>
                
                <div className="grid gap-3">
                  {goals.map((goal: string, index: number) => (
                    <div 
                      key={index} 
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                    >
                      <p className="text-gray-700 text-sm">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default PhaseCheckpoints;
