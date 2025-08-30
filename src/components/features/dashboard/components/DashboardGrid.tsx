import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`
      dashboard-grid 
      grid grid-cols-1 
      md:grid-cols-2 
      lg:grid-cols-3 
      gap-6 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default DashboardGrid;