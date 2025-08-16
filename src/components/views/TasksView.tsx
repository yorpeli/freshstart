import React from 'react';
import { Plus } from 'lucide-react';
import ViewHeader from '../shared/ViewHeader';
import { TasksContainer } from '../features/tasks';

const TasksView: React.FC = () => {

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

      <TasksContainer />
    </div>
  );
};

export default TasksView;
