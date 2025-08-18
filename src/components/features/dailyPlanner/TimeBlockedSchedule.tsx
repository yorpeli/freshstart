import React from 'react';
import { Clock, Video, CheckSquare, MoreVertical } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { useMeetings } from '../../../hooks/useMeetings';

interface TimeBlockedScheduleProps {
  selectedDate: Date;
  viewMode: '1day' | '3days' | 'week';
  viewRange: Date[];
}

interface TimeBlock {
  id: string;
  type: 'meeting' | 'task' | 'focus';
  title: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  date: Date; // The date this block belongs to
  priority?: number;
  status?: string;
  phase?: string;
  meetingType?: string;
  attendees?: string[];
  meetingId?: number; // For real meetings from Supabase
}

const TimeBlockedSchedule: React.FC<TimeBlockedScheduleProps> = ({ selectedDate, viewMode, viewRange }) => {
  // Get the date range for the current view
  const startDate = viewRange[0];
  const endDate = viewRange[viewRange.length - 1];
  
  // Fetch real meetings from Supabase
  const { data: meetings, isLoading, error } = useMeetings(startDate, endDate);

  // Transform meetings into time blocks
  const timeBlocks: TimeBlock[] = React.useMemo(() => {
    if (!meetings) return [];

    return meetings.map((meeting) => {
      const meetingDate = parseISO(meeting.scheduled_date);
      const startTime = format(meetingDate, 'HH:mm');
      const endTime = format(new Date(meetingDate.getTime() + meeting.duration_minutes * 60000), 'HH:mm');
      
      return {
        id: `meeting-${meeting.meeting_id}`,
        type: 'meeting' as const,
        title: meeting.meeting_name,
        startTime,
        endTime,
        duration: meeting.duration_minutes,
        date: meetingDate,
        status: meeting.status,
        phase: meeting.phase_name,
        meetingType: meeting.meeting_type,
        attendees: meeting.attendees,
        meetingId: meeting.meeting_id,
      };
    });
  }, [meetings]);

  // Calculate dynamic time range based on actual meeting times
  const timeRange = React.useMemo(() => {
    if (!timeBlocks.length) {
      // Default range if no meetings: 6 AM to 10 PM
      return { startHour: 6, endHour: 22, totalHours: 16 };
    }

    // Find earliest and latest meeting times
    let earliestHour = 23; // Start with latest possible hour
    let latestHour = 0;    // Start with earliest possible hour

    timeBlocks.forEach(block => {
      const [hours] = block.startTime.split(':').map(Number);
      const endHours = Math.ceil(block.duration / 60) + hours;
      
      earliestHour = Math.min(earliestHour, hours);
      latestHour = Math.max(latestHour, endHours);
    });

    // Add padding: 1 hour before earliest, 2 hours after latest
    const startHour = Math.max(0, earliestHour - 1);
    const endHour = Math.min(23, latestHour + 2);
    const totalHours = endHour - startHour;

    return { startHour, endHour, totalHours };
  }, [timeBlocks]);

  const timeSlots = Array.from({ length: timeRange.totalHours }, (_, i) => {
    const hour = timeRange.startHour + i;
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour,
    };
  });

  const getTimeBlockColor = (block: TimeBlock) => {
    switch (block.type) {
      case 'meeting':
        return 'bg-purple-100 border-purple-300 text-purple-900';
      case 'task':
        if (block.priority === 1) return 'bg-red-100 border-red-300 text-red-900';
        if (block.priority === 2) return 'bg-yellow-100 border-yellow-300 text-yellow-900';
        return 'bg-blue-100 border-blue-300 text-blue-900';
      case 'focus':
        return 'bg-green-100 border-green-300 text-green-900';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-900';
    }
  };

  const getTimeBlockIcon = (block: TimeBlock) => {
    switch (block.type) {
      case 'meeting':
        return <Video className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'focus':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTimeBlockHeight = (duration: number) => {
    // Each hour is 60px, so 30 minutes = 30px
    return Math.max(30, (duration / 60) * 60);
  };

  const getTimeBlockTop = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startHour = hours - timeRange.startHour; // Use dynamic start hour
    return startHour * 60 + minutes;
  };

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error loading meetings</p>
            <p className="text-gray-500 text-sm mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {viewMode === '1day' ? 'Daily Schedule' : 
           viewMode === '3days' ? '3-Day Schedule' : 'Weekly Schedule'}
        </h2>
        <div className="flex items-center space-x-2">
          {viewMode === '1day' ? (
            <>
              <span className="text-sm text-gray-500">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
              {isToday(selectedDate) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Today
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-500">
              {viewMode === '3days' 
                ? `${format(viewRange[0], 'MMM d')} - ${format(viewRange[viewRange.length - 1], 'MMM d, yyyy')}`
                : `${format(viewRange[0], 'MMM d')} - ${format(viewRange[viewRange.length - 1], 'MMM d, yyyy')}`
              }
            </span>
          )}
        </div>
      </div>

             {/* Time Grid */}
       <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden">
         {/* Time Labels */}
         <div className="absolute left-0 top-0 w-16 bg-gray-50 border-r border-gray-200">
           {timeSlots.map((slot) => (
             <div
               key={slot.time}
               className="h-15 border-b border-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium"
               style={{ height: '60px' }}
             >
               {slot.time}
             </div>
           ))}
         </div>

         {/* Day Headers for Multi-Day Views */}
         {viewMode !== '1day' && (
           <div className="absolute left-16 top-0 right-0 bg-gray-50 border-b border-gray-200 h-12 flex">
             {viewRange.map((date, index) => (
               <div
                 key={index}
                 className={`flex-1 border-r border-gray-200 flex flex-col items-center justify-center ${
                   isToday(date) ? 'bg-primary-50' : ''
                 }`}
               >
                 <div className="text-xs font-medium text-gray-900">
                   {format(date, 'EEE')}
                 </div>
                 <div className={`text-xs ${
                   isToday(date) ? 'text-primary-600 font-semibold' : 'text-gray-500'
                 }`}>
                   {format(date, 'd')}
                 </div>
               </div>
             ))}
           </div>
         )}

         {/* Time Blocks */}
         <div className={`relative ${viewMode !== '1day' ? 'ml-16 mt-12' : 'ml-16'}`}>
           {timeSlots.map((slot) => (
             <div
               key={slot.time}
               className="border-b border-gray-200"
               style={{ height: '60px' }}
             />
           ))}

                       {/* Day Columns for Multi-Day Views */}
            {viewMode !== '1day' && (
              <div className="absolute inset-0 flex">
                {viewRange.map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 border-r border-gray-200 last:border-r-0"
                  />
                ))}
              </div>
            )}

                       {/* Scheduled Items */}
            {timeBlocks.map((block) => {
              const top = getTimeBlockTop(block.startTime);
              const height = getTimeBlockHeight(block.duration);
              
              // For multi-day views, determine which day column to place the block
              let dayIndex = 0;
              if (viewMode !== '1day') {
                // Find which day in the viewRange this block belongs to
                const blockDate = format(block.date, 'yyyy-MM-dd');
                dayIndex = viewRange.findIndex(date => 
                  format(date, 'yyyy-MM-dd') === blockDate
                );
                // If block date is not in current view range, skip it
                if (dayIndex === -1) return null;
              }
              
              const dayWidth = viewMode === '1day' ? 'calc(100% - 16px)' : `${100 / viewRange.length}%`;
              const dayLeft = viewMode === '1day' ? '8px' : `${(dayIndex * 100 / viewRange.length)}%`;
              
              return (
                <div
                  key={block.id}
                  className={`absolute rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow ${getTimeBlockColor(block)}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: dayLeft,
                    width: dayWidth,
                    maxWidth: dayWidth,
                  }}
                >
                  <div className="flex items-start justify-between h-full">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getTimeBlockIcon(block)}
                        <span className="text-sm font-medium truncate">{block.title}</span>
                      </div>
                      <div className="text-xs opacity-75 mb-1">
                        {block.startTime} - {block.endTime}
                      </div>
                      {block.phase && (
                        <div className="text-xs opacity-75">{block.phase}</div>
                      )}
                      {block.attendees && block.attendees.length > 0 && (
                        <div className="text-xs opacity-75 mt-1">
                          {block.attendees.slice(0, 2).join(', ')}
                          {block.attendees.length > 2 && ` +${block.attendees.length - 2}`}
                        </div>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
         </div>
       </div>

      {/* Legend */}
      <div className="mt-6 flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
          <span className="text-gray-700">Meetings</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-700">High Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-gray-700">Medium Priority</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-700">Focus Time</span>
        </div>
      </div>
    </div>
  );
};

export default TimeBlockedSchedule;
