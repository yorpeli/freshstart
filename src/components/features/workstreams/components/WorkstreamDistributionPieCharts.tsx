import React from 'react';
import { useWorkstreamDistribution } from '../hooks/useWorkstreamDistribution';
import type { WorkstreamDistributionData } from '../hooks/useWorkstreamDistribution';
import { ErrorState } from '../../../shared';

interface WorkstreamDistributionPieChartsProps {
  className?: string;
}

interface PieChartProps {
  data: WorkstreamDistributionData[];
  title: string;
  total: number;
  size?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, title, total, size = 200 }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
        <div className="flex items-center justify-center" style={{ width: size, height: size }}>
          <div className="text-gray-400 text-center">
            <div className="text-sm">No data</div>
            <div className="text-xs">available</div>
          </div>
        </div>
      </div>
    );
  }

  const radius = (size - 40) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90; // Start from top
  const paths: JSX.Element[] = [];
  const legendItems: JSX.Element[] = [];

  data.forEach((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;

    const largeArcFlag = angle > 180 ? 1 : 0;

    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');

    paths.push(
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="white"
        strokeWidth="2"
        className="transition-all duration-200 hover:brightness-110 cursor-pointer"
        title={`${item.workstreamName}: ${item.count} (${item.percentage.toFixed(1)}%)`}
      />
    );

    legendItems.push(
      <div key={index} className="flex items-center gap-2 text-sm">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-gray-700">{item.workstreamName}</span>
        <span className="text-gray-500">
          {item.count} ({item.percentage.toFixed(1)}%)
        </span>
      </div>
    );

    currentAngle += angle;
  });

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      
      {/* Pie Chart */}
      <div className="relative mb-4">
        <svg width={size} height={size} className="drop-shadow-sm">
          {paths}
        </svg>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500 text-center">
            Total<br/>{title.toLowerCase()}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="space-y-2 w-full max-w-xs">
        {legendItems}
      </div>
    </div>
  );
};

export const WorkstreamDistributionPieCharts: React.FC<WorkstreamDistributionPieChartsProps> = ({ 
  className = '' 
}) => {
  const { data, isLoading, error } = useWorkstreamDistribution();

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading distribution data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load distribution data" error={error} />;
  }

  if (!data || (data.totalMeetings === 0 && data.totalTasks === 0)) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        <p>No data available to display distribution charts.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Workstream Distribution
        </h3>
        <p className="text-sm text-gray-600">
          Percentage breakdown of meetings and tasks across workstreams
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Meetings Pie Chart */}
        <PieChart
          data={data.meetings}
          title="Meetings"
          total={data.totalMeetings}
          size={200}
        />

        {/* Tasks Pie Chart */}
        <PieChart
          data={data.tasks}
          title="Tasks"
          total={data.totalTasks}
          size={200}
        />

        {/* Combined Pie Chart */}
        <PieChart
          data={data.combined}
          title="Combined"
          total={data.totalCombined}
          size={200}
        />
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.combined.map(item => (
            <div key={item.workstreamName} className="text-center">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: item.color }}
              >
                {item.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">{item.workstreamName}</div>
              <div className="text-xs text-gray-400">
                {item.count} total items
              </div>
            </div>
          ))}
        </div>

        {/* Additional insights */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">{data.totalMeetings}</div>
              <div className="text-sm text-gray-600">Total Meetings</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{data.totalTasks}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">
                {data.totalMeetings > 0 && data.totalTasks > 0 
                  ? (data.totalTasks / data.totalMeetings).toFixed(1) 
                  : '0'
                }
              </div>
              <div className="text-sm text-gray-600">Tasks per Meeting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
