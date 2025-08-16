import Card from '../ui/Card';

interface LoadingStateProps {
  count?: number;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ count = 4, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="bg-gray-200 h-6 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 rounded w-3/4 mb-4"></div>
          <div className="bg-gray-200 h-20 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
        </Card>
      ))}
    </div>
  );
};

export default LoadingState;