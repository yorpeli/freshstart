import React, { useState } from 'react';
import { format } from 'date-fns';
import { useWorkstreamInvestment } from '../hooks/useWorkstreamInvestment';
import type { WorkstreamInvestmentData } from '../hooks/useWorkstreamInvestment';
import { ErrorState } from '../../../shared';

interface WorkstreamInvestmentChartProps {
  className?: string;
}

type ChartType = 'stacked' | 'line';

export const WorkstreamInvestmentChart: React.FC<WorkstreamInvestmentChartProps> = ({ 
  className = '' 
}) => {
  const [chartType, setChartType] = useState<ChartType>('stacked');
  const { data: investmentData, isLoading, error } = useWorkstreamInvestment();

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading workstream investment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load workstream investment data" error={error} />;
  }

  if (!investmentData || investmentData.length === 0) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        <p>No meeting data available to display investment chart.</p>
      </div>
    );
  }

  // Get all unique workstream names
  const workstreamNames = Array.from(
    new Set(
      investmentData.flatMap(week => Object.keys(week.workstreams))
    )
  ).sort();

  // Define colors for workstreams (using the colors from the database)
  const workstreamColors: { [key: string]: string } = {
    'Product': '#3B82F6',
    'Process': '#10B981',
    'People': '#F59E0B',
    'Partnerships': '#EF4444'
  };

  // Find the maximum value for scaling
  const maxValue = Math.max(
    ...investmentData.map(week => 
      Object.values(week.workstreams).reduce((sum, count) => sum + count, 0)
    )
  );

  const renderStackedChart = () => (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex items-end gap-3 h-64">
          {investmentData.map((week, index) => (
            <div key={week.week} className="flex flex-col items-center">
              {/* Stacked Bars */}
              <div className="relative w-16 h-48">
                {workstreamNames.map((workstreamName, workstreamIndex) => {
                  const count = week.workstreams[workstreamName] || 0;
                  if (count === 0) return null;
                  
                  // Calculate the height and position for this workstream
                  const height = (count / maxValue) * 100;
                  const previousWorkstreamsHeight = workstreamNames
                    .slice(0, workstreamIndex)
                    .reduce((sum, name) => sum + (week.workstreams[name] || 0), 0);
                  const position = (previousWorkstreamsHeight / maxValue) * 100;
                  
                  return (
                    <div
                      key={workstreamName}
                      className="absolute w-full rounded-t border border-white/20 transition-all duration-200 hover:shadow-lg hover:scale-105"
                      style={{
                        backgroundColor: workstreamColors[workstreamName] || '#6B7280',
                        height: `${height}%`,
                        bottom: `${position}%`,
                        minHeight: count > 0 ? '4px' : '0'
                      }}
                      title={`${workstreamName}: ${count} meeting${count !== 1 ? 's' : ''}`}
                    />
                  );
                })}
              </div>
              
              {/* Week label */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                <div className="font-medium">
                  {format(week.weekStart, 'MMM d')}
                </div>
                <div className="text-xs text-gray-400">
                  {format(week.weekStart, 'MMM yyyy')}
                </div>
              </div>
              
              {/* Total count */}
              <div className="mt-1 text-xs font-medium text-gray-700">
                {week.totalMeetings}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="relative h-64">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-1 divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-gray-100"></div>
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
            {[...Array(6)].map((_, i) => (
              <span key={i}>{Math.round(maxValue * (1 - i / 5))}</span>
            ))}
          </div>
          
          {/* Lines for each workstream */}
          {workstreamNames.map((workstreamName) => {
            const points = investmentData.map((week, index) => {
              const count = week.workstreams[workstreamName] || 0;
              const x = index * 76 + 40; // 76px spacing between weeks to match stacked chart
              const y = 240 - (count / maxValue) * 192; // 192px chart height
              return { x, y, count };
            }).filter(point => point.count > 0);

            if (points.length < 2) return null;

            const pathData = points.map((point, index) => 
              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            ).join(' ');

            return (
              <g key={workstreamName}>
                <path
                  d={pathData}
                  stroke={workstreamColors[workstreamName] || '#6B7280'}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={workstreamColors[workstreamName] || '#6B7280'}
                    className="cursor-pointer"
                  >
                    <title>{`${workstreamName}: ${point.count} meeting${point.count !== 1 ? 's' : ''}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around">
            {investmentData.map((week, index) => (
              <div key={week.week} className="text-xs text-gray-500 text-center">
                <div className="font-medium">
                  {format(week.weekStart, 'MMM d')}
                </div>
                <div className="text-xs text-gray-400">
                  {format(week.weekStart, 'MMM yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Workstream Investment Over Time
            </h3>
            <p className="text-sm text-gray-600">
              Number of meetings per workstream per week
            </p>
          </div>
          
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('stacked')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'stacked'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Stacked
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Line
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          {workstreamNames.map(name => (
            <div key={name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: workstreamColors[name] || '#6B7280' }}
              />
              <span className="text-sm text-gray-700">{name}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartType === 'stacked' ? renderStackedChart() : renderLineChart()}

        {/* Summary stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workstreamNames.map(name => {
              const totalCount = investmentData.reduce(
                (sum, week) => sum + (week.workstreams[name] || 0), 
                0
              );
              
              return (
                <div key={name} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: workstreamColors[name] || '#6B7280' }}>
                    {totalCount}
                  </div>
                  <div className="text-sm text-gray-600">{name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
