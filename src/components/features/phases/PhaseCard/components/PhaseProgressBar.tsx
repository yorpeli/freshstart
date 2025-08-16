interface PhaseDistributionBarProps {
  learningPercentage: number;
  valuePercentage: number;
  className?: string;
}

const PhaseDistributionBar: React.FC<PhaseDistributionBarProps> = ({
  learningPercentage,
  valuePercentage,
  className = ''
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-blue-600 font-medium text-xs">Learning {learningPercentage}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-600 font-medium text-xs">Value {valuePercentage}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full flex">
          <div 
            className="bg-blue-500 transition-all duration-300"
            style={{ width: `${learningPercentage}%` }}
          />
          <div 
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${valuePercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PhaseDistributionBar;