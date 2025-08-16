import { AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';

interface ErrorStateProps {
  error?: Error;
  message?: string;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  message,
  onRetry, 
  title = 'Something went wrong',
  className = ''
}) => {
  const errorMessage = error?.message || message || 'An unknown error occurred';
  
  return (
    <div className={className}>
      <Card className="text-center py-12">
        <div className="text-red-500 mb-4">
          <AlertTriangle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        )}
      </Card>
    </div>
  );
};

export default ErrorState;