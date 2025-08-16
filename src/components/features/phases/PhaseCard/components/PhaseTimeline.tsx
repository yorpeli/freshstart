import { Calendar } from 'lucide-react';

interface PhaseTimelineProps {
  startDate: string;
  endDate: string;
  className?: string;
}

const PhaseTimeline: React.FC<PhaseTimelineProps> = ({
  startDate,
  endDate,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`flex items-center space-x-3 mb-4 text-sm text-gray-600 ${className}`}>
      <Calendar size={16} />
      <span>
        {formatDate(startDate)} - {formatDate(endDate)}
      </span>
    </div>
  );
};

export default PhaseTimeline;