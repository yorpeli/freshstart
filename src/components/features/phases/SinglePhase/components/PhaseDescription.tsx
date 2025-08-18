import React from 'react';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import Card from '../../../../ui/Card';
import type { Phase } from '../../../../../lib/types';

interface PhaseDescriptionProps {
  phase: Phase;
  className?: string;
}

const PhaseDescription: React.FC<PhaseDescriptionProps> = ({ phase, className = '' }) => {
  return (
    <Card className={className}>
      <div className="h-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Phase Details</h2>
        
        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Left Side - Description (Full Height) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText size={18} className="text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
            </div>
            {phase.description ? (
              <div className="bg-gray-50 rounded-lg p-6 h-full min-h-[300px]">
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{phase.description}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 h-full min-h-[300px] flex items-center justify-center">
                <p className="text-gray-500 italic">No description available for this phase.</p>
              </div>
            )}
          </div>

          {/* Right Side - Success Criteria & Constraints (Stacked) */}
          <div className="space-y-6">
                         {/* Success Criteria Section */}
             <div className="space-y-3 flex-1">
               <div className="flex items-center space-x-2">
                 <CheckCircle size={18} className="text-green-600" />
                 <h3 className="text-lg font-medium text-green-700">Success Criteria</h3>
               </div>
               {phase.success_criteria ? (
                 <div className="bg-green-100 rounded-lg p-6 border-l-4 border-green-500 min-h-[140px]">
                   <div className="prose prose-gray max-w-none">
                     <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{phase.success_criteria}</p>
                   </div>
                 </div>
               ) : (
                 <div className="bg-green-100 rounded-lg p-4 min-h-[140px] flex items-center justify-center border-l-4 border-green-500">
                   <p className="text-gray-500 italic">No success criteria defined for this phase.</p>
                 </div>
               )}
             </div>

             {/* Constraints Notes Section */}
             <div className="space-y-3 flex-1">
               <div className="flex items-center space-x-2">
                 <AlertTriangle size={18} className="text-orange-600" />
                 <h3 className="text-lg font-medium text-orange-700">Constraints & Notes</h3>
               </div>
               {phase.constraints_notes ? (
                 <div className="bg-orange-100 rounded-lg p-6 border-l-4 border-orange-500 min-h-[140px]">
                   <div className="prose prose-gray max-w-none">
                     <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{phase.constraints_notes}</p>
                   </div>
                 </div>
               ) : (
                 <div className="bg-orange-100 rounded-lg p-4 min-h-[140px] flex items-center justify-center border-l-4 border-orange-500">
                   <p className="text-gray-500 italic">No constraints or notes defined for this phase.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PhaseDescription;
