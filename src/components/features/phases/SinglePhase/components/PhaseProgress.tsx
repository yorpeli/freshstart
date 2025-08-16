import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import Card from '../../../../ui/Card';
import PhaseProgressBar from '../../PhaseCard/components/PhaseProgressBar';
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
        
        <div className="space-y-6">
          {/* Learning Progress */}
          <PhaseProgressBar
            label="Learning Progress"
            percentage={phase.learning_percentage}
            color="blue"
            icon={<TrendingUp size={20} />}
          />
          
          {/* Value Progress */}
          <PhaseProgressBar
            label="Value Progress"
            percentage={phase.value_percentage}
            color="green"
            icon={<Target size={20} />}
          />
        </div>

        {/* Progress Summary */}
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-600">Learning</p>
              <p className="text-2xl font-bold text-blue-700">{phase.learning_percentage}%</p>
              <p className="text-xs text-blue-600">
                {phase.learning_percentage >= 80 ? 'Complete' : 'In Progress'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-600">Value Delivery</p>
              <p className="text-2xl font-bold text-green-700">{phase.value_percentage}%</p>
              <p className="text-xs text-green-600">
                {phase.value_percentage >= 80 ? 'Complete' : 'In Progress'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PhaseProgress;
