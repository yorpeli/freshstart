import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import Card from '../../../../ui/Card';
import type { Phase } from '../../../../../lib/types';

interface PhaseDescriptionProps {
  phase: Phase;
  className?: string;
}

const PhaseDescription: React.FC<PhaseDescriptionProps> = ({ phase, className = '' }) => {
  return (
    <Card className={className}>
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Phase Details</h2>
        
        {/* Description Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileText size={18} className="text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
          </div>
          {phase.description ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{phase.description}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 italic">No description available for this phase.</p>
            </div>
          )}
        </div>

        {/* Success Criteria Section */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CheckCircle size={18} className="text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Success Criteria</h3>
          </div>
          {phase.success_criteria ? (
            <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-400">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{phase.success_criteria}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-500 italic">No success criteria defined for this phase.</p>
            </div>
          )}
        </div>

        {/* Constraints Notes Section */}
        {phase.constraints_notes && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText size={18} className="text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Constraints & Notes</h3>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{phase.constraints_notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PhaseDescription;
