import React from 'react';
import { Target, TrendingUp, Users, DollarSign } from 'lucide-react';
import Card from '../../../../ui/Card';
import Badge from '../../../../ui/Badge';
import type { Phase } from '../../../../../lib/types';

interface PhaseOutcomesProps {
  phase: Phase;
  className?: string;
}

const PhaseOutcomes: React.FC<PhaseOutcomesProps> = ({ phase, className = '' }) => {
  // Early return if no outcomes
  if (!phase.phase_outcomes || typeof phase.phase_outcomes !== 'object') {
    return null;
  }

  const outcomes = phase.phase_outcomes;
  
  // Check if we have any outcome data
  const hasData = Object.keys(outcomes).length > 0;
  if (!hasData) {
    return null;
  }

  const getSectionIcon = (key: string) => {
    switch (key) {
      case 'team_sentiment':
        return <Users size={16} className="text-blue-600" />;
      case 'personal_feeling':
        return <Target size={16} className="text-purple-600" />;
      case 'strategic_outputs':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'quantitative_outcomes':
        return <DollarSign size={16} className="text-orange-600" />;
      case 'stakeholder_sentiment':
        return <Users size={16} className="text-indigo-600" />;
      default:
        return <Target size={16} className="text-gray-600" />;
    }
  };

  const getSectionTitle = (key: string) => {
    switch (key) {
      case 'team_sentiment': return 'Team Sentiment';
      case 'personal_feeling': return 'Personal Feeling';
      case 'strategic_outputs': return 'Strategic Outputs';
      case 'quantitative_outcomes': return 'Quantitative Outcomes';
      case 'stakeholder_sentiment': return 'Stakeholder Sentiment';
      default: return key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card className={className}>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Target size={20} className="text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Phase Outcomes</h2>
        </div>

        <div className="space-y-6">
          {Object.entries(outcomes).map(([key, value]: [string, any]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            return (
              <div 
                key={key} 
                className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              >
                <div className="flex items-center space-x-2 mb-3">
                  {getSectionIcon(key)}
                  <h3 className="font-medium text-gray-900">{getSectionTitle(key)}</h3>
                </div>
                
                {Array.isArray(value) ? (
                  <div className="space-y-2">
                    {value.map((item: string, index: number) => (
                      <div 
                        key={index} 
                        className="bg-green-50 border border-green-200 rounded-lg p-3 w-full"
                      >
                        <p className="text-gray-700 text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 w-full">
                    <p className="text-gray-700 text-sm font-medium">"{value}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default PhaseOutcomes;
