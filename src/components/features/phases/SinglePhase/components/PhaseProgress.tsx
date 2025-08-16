import React from 'react';
import Card from '../../../../ui/Card';
import PhaseDistributionBar from '../../PhaseCard/components/PhaseProgressBar';
import type { Phase } from '../../../../../lib/types';

interface PhaseProgressProps {
  phase: Phase;
  className?: string;
}

const PhaseProgress: React.FC<PhaseProgressProps> = ({ phase, className = '' }) => {
  return (
    <Card className={className}>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Progress Overview</h2>
        
        <PhaseDistributionBar
          learningPercentage={phase.learning_percentage}
          valuePercentage={phase.value_percentage}
        />

        {/* Focus Summary */}
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Learning Focus</p>
              <p className="text-2xl font-bold text-blue-700">{phase.learning_percentage}%</p>
              <p className="text-xs text-blue-600">of phase time</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Value Focus</p>
              <p className="text-2xl font-bold text-green-700">{phase.value_percentage}%</p>
              <p className="text-xs text-green-600">of phase time</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PhaseProgress;
