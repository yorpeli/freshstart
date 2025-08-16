
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { usePhases } from '../../hooks/useSupabaseQuery';
import { Calendar, Target, TrendingUp, Clock } from 'lucide-react';

const PhasesView: React.FC = () => {
  const { data: phases, isLoading, error } = usePhases();

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
            <Target size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Phases</h3>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Onboarding Phases
        </h2>
        <p className="text-gray-600">
          Track progress across all onboarding phases with learning and value metrics.
        </p>
      </div>

      {/* Phases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {phases?.map((phase) => (
          <Card key={phase.phase_id} className="hover:shadow-md transition-shadow duration-200">
            {/* Phase Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{phase.phase_name}</h3>
              <Badge variant="outline" className="text-sm">
                Week {phase.start_week}-{phase.end_week}
              </Badge>
            </div>

            {/* Timeline */}
            <div className="flex items-center space-x-3 mb-4 text-sm text-gray-600">
              <Calendar size={16} />
              <span>
                {new Date(phase.start_date).toLocaleDateString()} - {new Date(phase.end_date).toLocaleDateString()}
              </span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4 mb-6">
              {/* Learning Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Learning Progress</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">{phase.learning_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phase.learning_percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Value Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Target size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Value Progress</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{phase.value_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${phase.value_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock size={14} />
                <span>Updated {new Date(phase.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex space-x-2">
                {phase.learning_percentage >= 80 && (
                  <Badge variant="success" className="text-xs">Learning Complete</Badge>
                )}
                {phase.value_percentage >= 80 && (
                  <Badge variant="success" className="text-xs">Value Delivered</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {phases?.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Target size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Phases Found</h3>
          <p className="text-gray-600">Get started by creating your first onboarding phase.</p>
        </Card>
      )}
    </div>
  );
};

export default PhasesView;
