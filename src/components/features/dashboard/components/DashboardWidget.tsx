import React from 'react';

interface DashboardWidgetProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  children,
  className = '',
  fullWidth = false
}) => {
  return (
    <div className={`
      dashboard-widget
      ${fullWidth ? 'col-span-full' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default DashboardWidget;