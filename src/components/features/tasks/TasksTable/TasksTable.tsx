import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TasksTableProps, TaskWithRelations } from '../types';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import TasksTableHeader from './TasksTableHeader';
import TaskRow from './TaskRow';

const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  groupBy,
  expandedGroups,
  onToggleGroup,
  onTaskClick
}) => {
  // Build task hierarchy
  const buildTaskHierarchy = (tasks: TaskWithRelations[]) => {
    const taskMap = new Map(tasks.map(task => [task.task_id, { ...task, subtasks: [] as TaskWithRelations[] }]));
    const rootTasks: TaskWithRelations[] = [];

    tasks.forEach(task => {
      const taskWithSubtasks = taskMap.get(task.task_id)!;
      if (task.parent_task_id && task.parent_task_id !== null) {
        const parent = taskMap.get(task.parent_task_id);
        if (parent) {
          parent.subtasks!.push(taskWithSubtasks);
        } else {
          // Parent not found in current filtered set, treat as root
          rootTasks.push(taskWithSubtasks);
        }
      } else {
        rootTasks.push(taskWithSubtasks);
      }
    });

    return rootTasks;
  };

  // Group tasks
  const groupedTasks = groupBy === 'none' ? { 'All Tasks': tasks } : 
    tasks.reduce((groups, task) => {
      let groupKey: string;
      switch (groupBy) {
        case 'phase':
          groupKey = task.phase_name || 'Unknown Phase';
          break;
        case 'type':
          groupKey = task.task_type?.type_name || 'Unknown Type';
          break;
        case 'status':
          groupKey = task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        default:
          groupKey = 'All Tasks';
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(task);
      return groups;
    }, {} as Record<string, TaskWithRelations[]>);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <TasksTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => {
              const hierarchicalTasks = buildTaskHierarchy(groupTasks);
              const isExpanded = expandedGroups.has(groupKey);

              return (
                <React.Fragment key={groupKey}>
                  {groupBy !== 'none' && (
                    <tr className="bg-gray-100">
                      <td colSpan={10} className="px-6 py-3">
                        <button
                          onClick={() => onToggleGroup(groupKey)}
                          className="flex items-center gap-2 w-full text-left"
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span className="font-semibold text-gray-900">{groupKey}</span>
                          <Badge className="bg-gray-200 text-gray-700">{groupTasks.length}</Badge>
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Always show tasks when no grouping, or when group is expanded */}
                  {(groupBy === 'none' || isExpanded) && hierarchicalTasks.map(task => (
                    <TaskRow key={task.task_id} task={task} onTaskClick={onTaskClick} />
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TasksTable;
