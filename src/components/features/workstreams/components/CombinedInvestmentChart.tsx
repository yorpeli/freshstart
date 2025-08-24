import React, { useState } from 'react';
import { format } from 'date-fns';
import { useWorkstreamInvestment } from '../hooks/useWorkstreamInvestment';
import { useTaskInvestment } from '../hooks/useTaskInvestment';
import type { WorkstreamInvestmentData } from '../hooks/useWorkstreamInvestment';
import type { TaskInvestmentData } from '../hooks/useTaskInvestment';
import { ErrorState } from '../../../shared';

interface CombinedInvestmentChartProps {
  className?: string;
}

type ChartType = 'stacked' | 'line';
type DataType = 'meetings' | 'tasks' | 'combined';

export const CombinedInvestmentChart: React.FC<CombinedInvestmentChartProps> = ({ 
  className = '' 
}) => {
  const [chartType, setChartType] = useState<ChartType>('stacked');
  const [dataType, setDataType] = useState<DataType>('combined');
  
  const { data: meetingData, isLoading: meetingsLoading, error: meetingsError } = useWorkstreamInvestment();
  const { data: taskData, isLoading: tasksLoading, error: tasksError } = useTaskInvestment();

  const isLoading = meetingsLoading || tasksLoading;
  const error = meetingsError || tasksError;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading investment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load investment data" error={error} />;
  }

  if (!meetingData || !taskData || (meetingData.length === 0 && taskData.length === 0)) {
    return (
      <div className={`p-6 text-center text-gray-500 ${className}`}>
        <p>No investment data available to display.</p>
      </div>
    );
  }

  // Get all unique workstream names from both datasets
  const allWorkstreamNames = Array.from(
    new Set([
      ...(meetingData?.flatMap(week => Object.keys(week.workstreams)) || []),
      ...(taskData?.flatMap(week => Object.keys(week.workstreams)) || [])
    ])
  ).sort();

  // Define colors for workstreams
  const workstreamColors: { [key: string]: string } = {
    'Product': '#3B82F6',
    'Process': '#10B981',
    'People': '#F59E0B',
    'Partnerships': '#EF4444'
  };

  // Combine data based on selected data type
  const getCombinedData = (): Array<{
    week: string;
    weekStart: Date;
    workstreams: { [workstreamName: string]: number };
    totalMeetings: number;
    totalTasks: number;
    totalInvestment: number;
  }> => {
    const allWeeks = new Set([
      ...(meetingData?.map(w => w.week) || []),
      ...(taskData?.map(w => w.week) || [])
    ]);

    return Array.from(allWeeks).map(week => {
      const meetingWeek = meetingData?.find(w => w.week === week);
      const taskWeek = taskData?.find(w => w.week === week);

      const combinedWorkstreams: { [key: string]: number } = {};
      
      allWorkstreamNames.forEach(name => {
        const meetingCount = meetingWeek?.workstreams[name] || 0;
        const taskCount = taskWeek?.workstreams[name] || 0;
        
        if (dataType === 'meetings') {
          combinedWorkstreams[name] = meetingCount;
        } else if (dataType === 'tasks') {
          combinedWorkstreams[name] = taskCount;
        } else {
          combinedWorkstreams[name] = meetingCount + taskCount;
        }
      });

      return {
        week,
        weekStart: meetingWeek?.weekStart || taskWeek?.weekStart || new Date(week),
        workstreams: combinedWorkstreams,
        totalMeetings: meetingWeek?.totalMeetings || 0,
        totalTasks: taskWeek?.totalTasks || 0,
        totalInvestment: (meetingWeek?.totalMeetings || 0) + (taskWeek?.totalTasks || 0)
      };
    }).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  };

  const combinedData = getCombinedData();
  
  // Find the maximum value for scaling
  // Note: Stacked chart uses maxValue directly, line chart uses adjustedMaxValue for better visual scaling
  const maxValue = Math.max(
    ...combinedData.map(week => 
      Object.values(week.workstreams).reduce((sum, count) => sum + count, 0)
    )
  );

  const renderStackedChart = () => (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="flex items-end gap-3 h-64">
          {combinedData.map((week, index) => (
            <div key={week.week} className="flex flex-col items-center">
              {/* Stacked Bars */}
              <div className="relative w-16 h-48">
                {allWorkstreamNames.map((workstreamName, workstreamIndex) => {
                  const count = week.workstreams[workstreamName] || 0;
                  if (count === 0) return null;
                  
                  // Calculate the height and position for this workstream
                  const height = (count / maxValue) * 100;
                  const previousWorkstreamsHeight = allWorkstreamNames
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
                      title={`${workstreamName}: ${count} ${dataType === 'meetings' ? 'meeting' : dataType === 'tasks' ? 'task' : 'item'}${count !== 1 ? 's' : ''}`}
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
              
              {/* Total counts */}
              <div className="mt-1 text-xs text-center">
                {dataType === 'combined' && (
                  <div className="font-medium text-gray-700">
                    {week.totalInvestment}
                  </div>
                )}
                {dataType === 'meetings' && (
                  <div className="font-medium text-blue-600">
                    {week.totalMeetings}
                  </div>
                )}
                {dataType === 'tasks' && (
                  <div className="font-medium text-green-600">
                    {week.totalTasks}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLineChart = () => {
    // For line chart, calculate max value from individual workstream lines, not total stacked value
    const lineChartMaxValue = Math.max(
      ...combinedData.flatMap(week => 
        allWorkstreamNames.map(workstream => week.workstreams[workstream] || 0)
      )
    );
    // Add 10% buffer for better visual scaling
    const adjustedMaxValue = lineChartMaxValue * 1.1;
    
    return (
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
                <span key={i}>{Math.round(adjustedMaxValue * (1 - i / 5))}</span>
              ))}
            </div>
          
          {/* SVG Chart Container */}
          <svg 
            className="absolute inset-0 w-full h-full" 
            viewBox={`0 0 ${Math.max(combinedData.length * 80, 400)} 240`}
            preserveAspectRatio="none"
          >
            {/* Background grid lines */}
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1="0"
                y1={40 + i * 40}
                x2={combinedData.length * 80}
                y2={40 + i * 40}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Lines for each workstream */}
            {allWorkstreamNames.map((workstreamName) => {
              const points = combinedData.map((week, index) => {
                const count = week.workstreams[workstreamName] || 0;
                const x = index * 80 + 40;
                const y = 200 - (count / adjustedMaxValue) * 160;
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
                      <title>{`${workstreamName}: ${point.count} ${dataType === 'meetings' ? 'meeting' : dataType === 'tasks' ? 'task' : 'item'}${point.count !== 1 ? 's' : ''}`}</title>
                    </circle>
                  ))}
                </g>
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-around">
            {combinedData.map((week, index) => (
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
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Combined Workstream Investment Over Time
            </h3>
            <p className="text-sm text-gray-600">
              {dataType === 'meetings' ? 'Meetings' : dataType === 'tasks' ? 'Tasks' : 'Meetings + Tasks'} per workstream per week
            </p>
          </div>
          
          {/* Controls */}
          <div className="flex gap-2">
            {/* Data Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDataType('meetings')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  dataType === 'meetings'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Meetings
              </button>
              <button
                onClick={() => setDataType('tasks')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  dataType === 'tasks'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setDataType('combined')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  dataType === 'combined'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Combined
              </button>
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
      </div>

      <div className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          {allWorkstreamNames.map(name => (
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
            {allWorkstreamNames.map(name => {
              const totalCount = combinedData.reduce(
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
          
          {/* Data type summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {meetingData?.reduce((sum, week) => sum + week.totalMeetings, 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Meetings</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {taskData?.reduce((sum, week) => sum + week.totalTasks, 0) || 0}
                </div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
