import React from 'react';
import { Milestone } from 'lucide-react';
import Card from '../../../../ui/Card';
import { usePhaseMilestoneTasks } from '../hooks/usePhaseMilestoneTasks';
import PhaseMilestoneCard from './PhaseMilestoneCard';
import type { Phase } from '../../../../../lib/types';

interface PhaseMilestonesProps {
  phase: Phase;
  className?: string;
}

const PhaseMilestones: React.FC<PhaseMilestonesProps> = ({ phase, className = '' }) => {
  const { data: milestoneTasks, isLoading, error } = usePhaseMilestoneTasks(phase.phase_id.toString());

  // Early return if no milestone tasks
  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Milestone size={20} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Key Milestones</h2>
          </div>
          <div className="text-gray-500 text-sm">Loading milestones...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Milestone size={20} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Key Milestones</h2>
          </div>
          <div className="text-red-500 text-sm">Error loading milestones</div>
        </div>
      </Card>
    );
  }

  if (!milestoneTasks || milestoneTasks.length === 0) {
    return (
      <Card className={className}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Milestone size={20} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Key Milestones</h2>
          </div>
          <div className="text-gray-500 text-sm">No milestone tasks found for this phase.</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Milestone size={20} className="text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Key Milestones</h2>
        </div>

        <div className="space-y-4">
          {milestoneTasks.map((task) => (
            <PhaseMilestoneCard key={task.task_id} task={task} />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PhaseMilestones;
