import { TrendingUp, Target } from 'lucide-react';
import Card from '../../../ui/Card';
import PhaseHeader from './components/PhaseHeader';
import PhaseTimeline from './components/PhaseTimeline';
import PhaseProgressBar from './components/PhaseProgressBar';
import PhaseStatus from './components/PhaseStatus';
import type { Phase } from '../../../../lib/types';

interface PhaseCardProps {
  phase: Phase;
  className?: string;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ phase, className = '' }) => {
  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 ${className}`}>
      <PhaseHeader
        title={phase.phase_name}
        startWeek={phase.start_week}
        endWeek={phase.end_week}
      />
      
      <PhaseTimeline
        startDate={phase.start_date}
        endDate={phase.end_date}
      />
      
      <div className="space-y-4 mb-6">
        <PhaseProgressBar
          label="Learning Progress"
          percentage={phase.learning_percentage}
          color="blue"
          icon={<TrendingUp size={16} />}
        />
        
        <PhaseProgressBar
          label="Value Progress"
          percentage={phase.value_percentage}
          color="green"
          icon={<Target size={16} />}
        />
      </div>
      
      <PhaseStatus
        updatedAt={phase.updated_at}
        learningPercentage={phase.learning_percentage}
        valuePercentage={phase.value_percentage}
      />
    </Card>
  );
};

export default PhaseCard;