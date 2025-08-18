import React from 'react';
import Tabs from '../../../../ui/Tabs';
import PhaseOverview from './PhaseOverview';
import PhaseMeetings from './PhaseMeetings';
import PhaseTasks from './PhaseTasks';
import type { Phase } from '../../../../../lib/types';

interface PhaseTabsProps {
  phase: Phase;
  className?: string;
}

const PhaseTabs: React.FC<PhaseTabsProps> = ({ phase, className = '' }) => {
  return (
    <Tabs.Root defaultTab="overview" className={className}>
      <Tabs.List>
        <Tabs.Trigger value="overview">Phase Overview</Tabs.Trigger>
        <Tabs.Trigger value="tasks">Tasks</Tabs.Trigger>
        <Tabs.Trigger value="meetings">Meetings</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="overview">
        <PhaseOverview phase={phase} />
      </Tabs.Content>

      <Tabs.Content value="tasks">
        <PhaseTasks phase={phase} />
      </Tabs.Content>

      <Tabs.Content value="meetings">
        <PhaseMeetings phase={phase} />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default PhaseTabs;
