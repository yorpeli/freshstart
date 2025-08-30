import React from 'react';

interface DashboardHeroProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`
      dashboard-hero 
      mb-8 
      p-6 
      bg-white 
      rounded-lg 
      shadow-sm 
      border 
      border-gray-200
      ${className}
    `}>
      {children}
    </div>
  );
};

export default DashboardHero;