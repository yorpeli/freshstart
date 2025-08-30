import React from 'react';

const ExecutiveSummary: React.FC = () => {
  return (
    <div className="executive-summary">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Executive Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Phase Status</h3>
          <div className="text-blue-600 text-center py-4">
            Phase Status Card - Coming in Phase 2
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-2">Team Health</h3>
          <div className="text-green-600 text-center py-4">
            Team Health Indicator - Coming in Phase 2
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800 mb-2">Liberation Wins</h3>
          <div className="text-purple-600 text-center py-4">
            Liberation Wins Counter - Coming in Phase 2
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Confidence Meter</h3>
          <div className="text-amber-600 text-center py-4">
            Confidence Meter - Coming in Phase 2
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;