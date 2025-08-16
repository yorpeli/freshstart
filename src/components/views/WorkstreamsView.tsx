
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useWorkstreams } from '../../hooks/useSupabaseQuery';
import { Target, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { priorityColors } from '../../lib/types';

const WorkstreamsView: React.FC = () => {
  const { data: workstreams, isLoading, error } = useWorkstreams();

  // Safety check for workstreams data
  const safeWorkstreams = workstreams || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="bg-gray-200 h-6 rounded mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-4"></div>
              <div className="bg-gray-200 h-20 rounded mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Target size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Workstreams</h3>
          <p className="text-gray-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  const getPriorityIcon = (priority: number | null) => {
    if (!priority) return <Target size={16} className="text-gray-500" />;
    
    switch (priority) {
      case 3: // High priority
        return <AlertCircle size={16} className="text-red-500" />;
      case 2: // Medium priority
        return <Clock size={16} className="text-yellow-500" />;
      case 1: // Low priority
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <Target size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (priority: number | null) => {
    if (!priority) return 'border-l-gray-500';
    
    switch (priority) {
      case 3: // High priority
        return 'border-l-red-500';
      case 2: // Medium priority
        return 'border-l-yellow-500';
      case 1: // Low priority
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getPriorityDisplay = (priority: number | null) => {
    if (!priority) return 'Unknown';
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  const getPriorityColorClass = (priority: number | null) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    return priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Workstreams
        </h2>
        <p className="text-gray-600">
          Manage Product, Process, People, and Partnerships workstreams with priority tracking.
        </p>
      </div>

      {/* Workstreams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeWorkstreams.length > 0 ? safeWorkstreams.map((workstream) => (
          <Card 
            key={workstream.workstream_id} 
            className={`hover:shadow-md transition-shadow duration-200 border-l-4 ${getStatusColor(workstream.priority)}`}
          >
            {/* Workstream Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{workstream.workstream_name}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{workstream.description}</p>
              </div>
            </div>

            {/* Priority Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getPriorityIcon(workstream.priority)}
                <span className="text-sm font-medium text-gray-700">Priority</span>
              </div>
              <Badge 
                className={`text-xs ${getPriorityColorClass(workstream.priority)}`}
              >
                {getPriorityDisplay(workstream.priority)}
              </Badge>
            </div>

            {/* Color Indicator */}
            <div className="flex items-center space-x-2 mb-4">
              <div 
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: workstream.color || '#6b7280' }}
              ></div>
              <span className="text-xs text-gray-500">Theme Color</span>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>Created {new Date(workstream.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-xs text-gray-400">
                ID: {workstream.workstream_id}
              </div>
            </div>
          </Card>
        )) : null}
      </div>

      {/* Empty State */}
      {safeWorkstreams.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Target size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workstreams Found</h3>
          <p className="text-gray-600">Get started by creating your first workstream.</p>
        </Card>
      )}

      {/* Workstream Categories Info */}
      <div className="mt-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Workstream Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">Product</span>
              <span className="text-xs text-blue-600">Product strategy and development</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Process</span>
              <span className="text-xs text-green-600">Operational processes and workflows</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-700">People</span>
              <span className="text-xs text-amber-600">Team building and management</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-700">Partnerships</span>
              <span className="text-xs text-purple-600">External relationships and alliances</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkstreamsView;
