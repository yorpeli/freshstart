import React from 'react';
import { Dashboard } from './index';
import ErrorBoundary from '../../ui/ErrorBoundary';
import ExecutiveSummary from './components/ExecutiveSummary/ExecutiveSummary';

const DashboardContainer: React.FC = () => {
  return (
    <ErrorBoundary>
      <Dashboard.Root>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Executive Dashboard 🎯
          </h1>
          <p className="text-gray-600">
            Strategic command center for VP Product onboarding and transition leadership.
          </p>
        </div>

        {/* Hero Section - Executive Summary */}
        <Dashboard.Hero>
          <ExecutiveSummary />
        </Dashboard.Hero>

        {/* Main Dashboard Grid */}
        <Dashboard.Grid>
          <Dashboard.Widget>
            <Dashboard.Section title="Phase Progress">
              <div className="text-gray-500 text-center py-8">
                Phase Progress Widget - Coming in Phase 2
              </div>
            </Dashboard.Section>
          </Dashboard.Widget>

          <Dashboard.Widget>
            <Dashboard.Section title="Workstream Status">
              <div className="text-gray-500 text-center py-8">
                Workstream Status Widget - Coming in Phase 3
              </div>
            </Dashboard.Section>
          </Dashboard.Widget>

          <Dashboard.Widget>
            <Dashboard.Section title="Team Momentum">
              <div className="text-gray-500 text-center py-8">
                Team Momentum Widget - Coming in Phase 3
              </div>
            </Dashboard.Section>
          </Dashboard.Widget>

          <Dashboard.Widget>
            <Dashboard.Section title="Meeting ROI">
              <div className="text-gray-500 text-center py-8">
                Meeting ROI Widget - Coming in Phase 3
              </div>
            </Dashboard.Section>
          </Dashboard.Widget>

          <Dashboard.Widget>
            <Dashboard.Section title="Stakeholder Engagement">
              <div className="text-gray-500 text-center py-8">
                Stakeholder Engagement Widget - Coming in Phase 4
              </div>
            </Dashboard.Section>
          </Dashboard.Widget>

          <Dashboard.Widget>
            <Dashboard.Section title="Initiatives Pipeline">
              <div className="text-gray-500 text-center py-8">
                Initiatives Pipeline Widget - Coming in Phase 4
              </div>
            </Dashboard.Section>
          </Dashboard.Widget>
        </Dashboard.Grid>
      </Dashboard.Root>
    </ErrorBoundary>
  );
};

export default DashboardContainer;