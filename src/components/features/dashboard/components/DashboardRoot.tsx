import React from 'react';

interface DashboardRootProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardRoot: React.FC<DashboardRootProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`dashboard-root p-6 min-h-screen bg-gray-50 ${className}`}>
      {children}
    </div>
  );
};

export default DashboardRoot;