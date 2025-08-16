interface PhaseProgressBarProps {
  label: string;
  percentage: number;
  color: 'blue' | 'green';
  icon: React.ReactNode;
  className?: string;
}

const PhaseProgressBar: React.FC<PhaseProgressBarProps> = ({
  label,
  percentage,
  color,
  icon,
  className = ''
}) => {
  const colorClasses = {
    blue: {
      text: 'text-blue-600',
      icon: 'text-blue-500',
      bar: 'bg-blue-500'
    },
    green: {
      text: 'text-green-600',
      icon: 'text-green-500',
      bar: 'bg-green-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={classes.icon}>{icon}</div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-semibold ${classes.text}`}>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${classes.bar} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default PhaseProgressBar;