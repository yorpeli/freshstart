// Main phases list exports
export { default as PhasesList } from './PhasesList';
export { default as PhasesContainer } from './PhasesContainer';

// Single Phase View exports
export { 
  SinglePhaseContainer,
  SinglePhaseDetails,
  PhaseBackButton,
  PhaseMetadata,
  PhaseProgress,
  PhaseDescription,
  PhaseTabs,
  PhaseOverview,
  PhaseTasks,
  PhaseMeetings,
  EditableText,
  EditableNumber,
  EditableDate,
  // New Phase Milestone components
  PhaseMilestoneCard,
  usePhaseMilestoneTasks
} from './SinglePhase';

// Re-export sub-components for advanced usage
export {
  PhaseHeader,
  PhaseTimeline,
  PhaseProgressBar,
  PhaseStatus
} from './PhaseCard';