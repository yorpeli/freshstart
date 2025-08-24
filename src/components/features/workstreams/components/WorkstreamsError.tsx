import React from 'react';
import { Target } from 'lucide-react';
import Card from '../../../ui/Card';

interface WorkstreamsErrorProps {
  error: Error;
  onRetry?: () => void;
  title?: string;
}

const WorkstreamsError: React.FC<WorkstreamsErrorProps> = ({ 
  error, 
  onRetry, 
  title = "Error Loading Workstreams" 
}) => (
  <Card className="text-center py-12">
    <div className="text-red-500 mb-4">
      <Target size={48} className="mx-auto" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{error.message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </Card>
);

export default WorkstreamsError;