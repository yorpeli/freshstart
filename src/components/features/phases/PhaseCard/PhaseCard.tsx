import { TrendingUp, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Phase card clicked:', phase.phase_id);
    console.log('Navigating to:', `/phases/${phase.phase_id}`);
    try {
      navigate(`/phases/${phase.phase_id}`);
      console.log('Navigation successful');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div>
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
        
        {/* Details Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleClick}
            className="w-full flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <span>View Details</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
};

export default PhaseCard;