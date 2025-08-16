import ViewHeader from '../shared/ViewHeader';
import PhasesContainer from '../features/phases/PhasesContainer';

const PhasesView: React.FC = () => {
  return (
    <div className="p-6">
      <ViewHeader
        title="Onboarding Phases"
        description="Track progress across all onboarding phases with learning and value metrics."
      />
      <PhasesContainer />
    </div>
  );
};

export default PhasesView;