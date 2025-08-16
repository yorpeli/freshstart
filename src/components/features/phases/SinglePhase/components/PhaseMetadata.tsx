import React from 'react';
import { Calendar, Hash, Clock } from 'lucide-react';
import Card from '../../../../ui/Card';
import Badge from '../../../../ui/Badge';
import type { Phase } from '../../../../../lib/types';

interface PhaseMetadataProps {
  phase: Phase;
  className?: string;
}

const PhaseMetadata: React.FC<PhaseMetadataProps> = ({ phase, className = '' }) => {
  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Phase Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{phase.phase_name}</h1>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Week {phase.start_week}-{phase.end_week}
          </Badge>
        </div>

        {/* Basic Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          {/* Phase Number */}
          <div className="flex items-center space-x-3">
            <Hash size={18} className="text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Phase Number</p>
              <p className="text-lg font-semibold text-gray-900">{phase.phase_number}</p>
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-3">
            <Calendar size={18} className="text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(phase.start_date).toLocaleDateString()} - {new Date(phase.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Working Days */}
          {phase.working_days && (
            <div className="flex items-center space-x-3">
              <Clock size={18} className="text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Working Days</p>
                <p className="text-lg font-semibold text-gray-900">{phase.working_days}</p>
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="flex items-center space-x-3">
            <Clock size={18} className="text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-500">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(phase.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-500">Phase ID</p>
            <p className="text-sm text-gray-700">{phase.phase_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Created</p>
            <p className="text-sm text-gray-700">{new Date(phase.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PhaseMetadata;
