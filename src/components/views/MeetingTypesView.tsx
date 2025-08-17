
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useMeetingTypes } from '../../hooks/useSupabaseQuery';
import { Calendar, Clock, FileText, Settings, Play } from 'lucide-react';

const MeetingTypesView: React.FC = () => {
  const { data: meetingTypes, isLoading, error } = useMeetingTypes();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Meeting Types</h3>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const getTemplatePreview = (template: any) => {
    if (!template) return 'No template defined';
    
    try {
      if (typeof template === 'string') {
        return template.length > 100 ? template.substring(0, 100) + '...' : template;
      }
      
      if (typeof template === 'object') {
        const keys = Object.keys(template);
        if (keys.length === 0) return 'Empty template';
        
        const preview = keys.slice(0, 3).map(key => `${key}: ${template[key]}`).join(', ');
        return preview.length > 100 ? preview.substring(0, 100) + '...' : preview;
      }
      
      return String(template).substring(0, 100) + '...';
    } catch (error) {
      return 'Template preview unavailable';
    }
  };

  const getMeetingCategory = (typeName: string) => {
    const lowerName = typeName.toLowerCase();
    if (lowerName.includes('standup') || lowerName.includes('daily')) return 'Daily';
    if (lowerName.includes('review') || lowerName.includes('retro')) return 'Review';
    if (lowerName.includes('planning') || lowerName.includes('plan')) return 'Planning';
    if (lowerName.includes('sync') || lowerName.includes('check')) return 'Sync';
    if (lowerName.includes('workshop') || lowerName.includes('training')) return 'Workshop';
    return 'Other';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Daily': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-green-100 text-green-800';
      case 'Planning': return 'bg-purple-100 text-purple-800';
      case 'Sync': return 'bg-amber-100 text-amber-800';
      case 'Workshop': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Meeting Types
        </h2>
        <p className="text-gray-600">
          Manage meeting templates and configurations for different types of meetings.
        </p>
      </div>

      {/* Meeting Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meetingTypes?.map((meetingType) => {
          const category = getMeetingCategory(meetingType.type_name);
          return (
            <Card key={meetingType.meeting_type_id} className="hover:shadow-md transition-shadow duration-200">
              {/* Meeting Type Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{meetingType.type_name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{meetingType.description}</p>
                </div>
                <Badge className={`text-xs ${getCategoryColor(category)}`}>
                  {category}
                </Badge>
              </div>

              {/* Duration and Template Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>Duration: {formatDuration(meetingType.default_duration_minutes || 0)}</span>
                </div>
                
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <FileText size={14} className="mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium">Template:</span>
                    <p className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                      {getTemplatePreview(meetingType.template_structure)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Template Structure */}
              {meetingType.template_structure && typeof meetingType.template_structure === 'object' && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings size={14} />
                    <span className="text-sm font-medium text-gray-700">Template Structure</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(meetingType.template_structure, null, 2).substring(0, 200)}
                      {JSON.stringify(meetingType.template_structure, null, 2).length > 200 && '...'}
                    </pre>
                  </div>
                </div>
              )}

              {/* Actions and Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar size={14} />
                  <span>Created {new Date(meetingType.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors">
                    <Play size={12} />
                    <span>Use Template</span>
                  </button>
                  <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800 transition-colors">
                    <Settings size={12} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {meetingTypes?.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meeting Types Found</h3>
          <p className="text-gray-600">Get started by creating your first meeting type template.</p>
        </Card>
      )}

      {/* Meeting Categories Info */}
      <div className="mt-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-blue-700">Daily</span>
                <p className="text-xs text-blue-600">Standups and daily syncs</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-green-700">Review</span>
                <p className="text-xs text-green-600">Retrospectives and reviews</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-purple-700">Planning</span>
                <p className="text-xs text-purple-600">Sprint planning and roadmaps</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-amber-700">Sync</span>
                <p className="text-xs text-amber-600">Status updates and check-ins</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-red-700">Workshop</span>
                <p className="text-xs text-red-600">Training and collaborative sessions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-gray-700">Other</span>
                <p className="text-xs text-gray-600">Specialized meeting types</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MeetingTypesView;
