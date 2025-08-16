import Badge from '../../../../ui/Badge';

interface PhaseHeaderProps {
  title: string;
  startWeek: number;
  endWeek: number;
  className?: string;
}

const PhaseHeader: React.FC<PhaseHeaderProps> = ({
  title,
  startWeek,
  endWeek,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <Badge variant="outline" className="text-sm">
        Week {startWeek}-{endWeek}
      </Badge>
    </div>
  );
};

export default PhaseHeader;