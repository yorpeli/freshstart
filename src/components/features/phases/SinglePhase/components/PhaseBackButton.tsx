import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PhaseBackButtonProps {
  className?: string;
}

const PhaseBackButton: React.FC<PhaseBackButtonProps> = ({ className = '' }) => {
  return (
    <Link
      to="/phases"
      className={`inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 ${className}`}
    >
      <ArrowLeft size={16} />
      <span>Back to Phases</span>
    </Link>
  );
};

export default PhaseBackButton;
