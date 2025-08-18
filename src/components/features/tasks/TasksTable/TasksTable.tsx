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
    (() => {
      const groups = tasks.reduce((groups, task) => {
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
          case 'date':
            if (task.due_date) {
              const dueDate = new Date(task.due_date);
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              if (dueDate < today) {
                groupKey = 'Overdue';
              } else if (dueDate.toDateString() === today.toDateString()) {
                groupKey = 'Due Today';
              } else if (dueDate.toDateString() === tomorrow.toDateString()) {
                groupKey = 'Due Tomorrow';
              } else if (dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
                groupKey = 'Due This Week';
              } else {
                // Group by calendar month
                const monthNames = [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ];
                const month = monthNames[dueDate.getMonth()];
                const year = dueDate.getFullYear();
                const currentYear = today.getFullYear();
                
                if (year === currentYear) {
                  groupKey = month;
                } else if (year === currentYear + 1) {
                  groupKey = `${month} ${year}`;
                } else if (year === currentYear - 1) {
                  groupKey = `${month} ${year}`;
                } else {
                  groupKey = `${month} ${year}`;
                }
              }
            } else {
              groupKey = 'No Due Date';
            }
            break;
          default:
            groupKey = 'All Tasks';
        }
        
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(task);
        return groups;
      }, {} as Record<string, TaskWithRelations[]>);

      // Sort date groups in chronological order
      if (groupBy === 'date') {
        const sortedGroups: Record<string, TaskWithRelations[]> = {};
        const groupOrder = [
          'Overdue',
          'Due Today', 
          'Due Tomorrow',
          'Due This Week'
        ];
        
        // Add immediate groups first
        groupOrder.forEach(key => {
          if (groups[key]) {
            sortedGroups[key] = groups[key];
          }
        });
        
        // Add month groups in chronological order
        const monthGroups = Object.keys(groups).filter(key => 
          !groupOrder.includes(key) && key !== 'No Due Date'
        );
        
        monthGroups.sort((a, b) => {
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          
          // Extract month and year from group keys
          const getMonthYear = (key: string) => {
            const parts = key.split(' ');
            if (parts.length === 1) {
              // Current year, just month name
              const monthIndex = monthNames.indexOf(parts[0]);
              return { month: monthIndex, year: new Date().getFullYear() };
            } else {
              // Month + year format
              const monthIndex = monthNames.indexOf(parts[0]);
              const year = parseInt(parts[1]);
              return { month: monthIndex, year };
            }
          };
          
          const aInfo = getMonthYear(a);
          const bInfo = getMonthYear(b);
          
          if (aInfo.year !== bInfo.year) {
            return aInfo.year - bInfo.year;
          }
          return aInfo.month - bInfo.month;
        });
        
        monthGroups.forEach(key => {
          sortedGroups[key] = groups[key];
        });
        
        // Add "No Due Date" at the end
        if (groups['No Due Date']) {
          sortedGroups['No Due Date'] = groups['No Due Date'];
        }
        
        return sortedGroups;
      }
      
      return groups;
    })();

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
