import React from 'react';
import { WorkstreamsContainer, WorkstreamCategories, CombinedInvestmentChart, WorkstreamDistributionPieCharts } from '../features/workstreams';

const WorkstreamsView: React.FC = () => {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Workstreams
        </h2>
        <p className="text-gray-600">
          Manage Product, Process, People, and Partnerships workstreams with priority tracking and comprehensive investment analytics.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <CombinedInvestmentChart />
        <WorkstreamDistributionPieCharts />
        <WorkstreamsContainer />
        <WorkstreamCategories />
      </div>
    </div>
  );
};

export default WorkstreamsView;