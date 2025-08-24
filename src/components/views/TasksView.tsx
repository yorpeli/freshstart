import React, { useState } from 'react';
import { Plus, Calendar, Table } from 'lucide-react';
import ViewHeader from '../shared/ViewHeader';
import TasksContainer from '../features/tasks/TasksContainer';
import { TaskDistributionView } from '../features/tasks/TaskDistributionView';
import TaskDetailModal from '../features/tasks/TaskDetailModal/TaskDetailModal';
import type { TaskWithRelations } from '../features/tasks/types';

type ViewMode = 'table' | 'distribution';

const TasksView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskClick = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <ViewHeader
        title="Tasks"
        description="Manage and track onboarding tasks and action items"
        action={
          <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2">
            <Plus size={16} />
            Add Task
          </button>
        }
      />

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">View Mode</h3>
            <p className="text-sm text-gray-500">
              {viewMode === 'table' 
                ? 'Traditional table view for detailed task management' 
                : 'Day-based distribution view for planning and workload overview'
              }
            </p>
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="h-4 w-4" />
              Table View
            </button>
            <button
              onClick={() => setViewMode('distribution')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                viewMode === 'distribution'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Distribution View
            </button>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <TasksContainer />
      ) : (
        <TaskDistributionView onTaskClick={handleTaskClick} />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={closeTaskModal}
        />
      )}
    </div>
  );
};

export default TasksView;
