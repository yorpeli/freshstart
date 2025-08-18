import React from 'react';
import { Calendar, Info, ChevronUp } from 'lucide-react';
import Card from '../../../../ui/Card';
import Badge from '../../../../ui/Badge';
import { EditableText, EditableDate } from './editing';
import usePhaseEditing from '../../../../../hooks/usePhaseEditing';
import type { Phase } from '../../../../../lib/types';

interface PhaseMetadataProps {
  phase: Phase;
  className?: string;
}

const PhaseMetadata: React.FC<PhaseMetadataProps> = ({ phase, className = '' }) => {
  const { saveChanges } = usePhaseEditing(phase.phase_id.toString(), phase);

  // Calculate working days between start and end date
  const calculateWorkingDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };



  // Format date with year
  const formatDateWithYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const workingDays = calculateWorkingDays(phase.start_date, phase.end_date);

  const handleSave = async (field: keyof Phase, value: any) => {
    await saveChanges({ [field]: value });
  };

  return (
    <Card className={className}>
      <div className="space-y-6">
                        {/* Phase Header */}
                <div className="flex items-center justify-between">
                  <EditableText
                    value={phase.phase_name}
                    onSave={(value) => handleSave('phase_name', value)}
                    placeholder="Enter phase name"
                    className="text-2xl font-bold"
                    required
                  />
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      Week {phase.start_week}-{phase.end_week}
                    </Badge>
                  </div>
                                </div>

                {/* Learn vs Value Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>Learning {phase.learning_percentage || 80}%</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600">
                      <span>Value {phase.value_percentage || 20}%</span>
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="flex h-full">
                      <div 
                        className="bg-blue-600 h-full rounded-l-full transition-all duration-300"
                        style={{ width: `${phase.learning_percentage || 80}%` }}
                      ></div>
                      <div 
                        className="bg-green-600 h-full rounded-r-full transition-all duration-300"
                        style={{ width: `${phase.value_percentage || 20}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200">
          {/* Phase Number */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Phase Number</p>
            <p className="text-lg font-semibold text-gray-900">{phase.phase_number} of 4</p>
          </div>

          {/* Date Range */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Date Range</p>
            <p className="text-lg font-semibold text-gray-900">
              <EditableDate
                value={phase.start_date}
                onSave={(value) => handleSave('start_date', value)}
                className="inline-block"
              />
              <span className="text-gray-500 mx-1">-</span>
              <EditableDate
                value={phase.end_date}
                onSave={(value) => handleSave('end_date', value)}
                className="inline-block"
              />
            </p>
          </div>

          {/* Working Days */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Working Days</p>
            <p className="text-lg font-semibold text-gray-900">{workingDays} days</p>
          </div>
        </div>

        {/* Bottom Metadata Section */}
        <div className="pt-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center space-x-2">
            <Info size={16} className="text-gray-400" />
            <span className="text-sm text-gray-700">Phase ID: PH-{new Date(phase.created_at).getFullYear()}-{String(phase.phase_id).padStart(3, '0')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-700">Created: {formatDateWithYear(phase.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-700">Last Updated: {formatDateWithYear(phase.updated_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PhaseMetadata;
