import { Clock } from 'lucide-react';
import Badge from '../../../../ui/Badge';

interface PhaseStatusProps {
  updatedAt: string;
  learningPercentage: number;
  valuePercentage: number;
  className?: string;
}

const PhaseStatus: React.FC<PhaseStatusProps> = ({
  updatedAt,
  learningPercentage,
  valuePercentage,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const showLearningComplete = learningPercentage >= 80;
  const showValueDelivered = valuePercentage >= 80;

  return (
    <div className={`flex items-center justify-between pt-4 border-t border-gray-100 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Clock size={14} />
        <span>Updated {formatDate(updatedAt)}</span>
      </div>
      <div className="flex space-x-2">
        {showLearningComplete && (
          <Badge variant="success" className="text-xs">Learning Complete</Badge>
        )}
        {showValueDelivered && (
          <Badge variant="success" className="text-xs">Value Delivered</Badge>
        )}
      </div>
    </div>
  );
};

export default PhaseStatus;