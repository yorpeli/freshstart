import React from 'react';
import Card from '../../../ui/Card';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  loading?: boolean;
  error?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  children,
  className = '',
  headerActions,
  loading = false,
  error
}) => {
  return (
    <Card className={`dashboard-section ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {headerActions && (
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        )}
      </div>
      
      {error ? (
        <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      ) : loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      ) : (
        children
      )}
    </Card>
  );
};

export default DashboardSection;