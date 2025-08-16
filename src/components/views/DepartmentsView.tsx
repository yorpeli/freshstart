
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { useDepartments, usePeople } from '../../hooks/useSupabaseQuery';
import { Building2, Users, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

const DepartmentsView: React.FC = () => {
  const { data: departments, isLoading: deptLoading, error: deptError } = useDepartments();
  const { data: people, isLoading: peopleLoading } = usePeople();

  const isLoading = deptLoading || peopleLoading;

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

  if (deptError) {
    return (
      <div className="p-6">
        <Card className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Building2 size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Departments</h3>
          <p className="text-gray-600">{deptError.message}</p>
        </Card>
      </div>
    );
  }

  // Calculate team counts for each department
  const departmentsWithCounts = departments?.map(dept => {
    const teamCount = people?.filter(person => person.department_id === dept.department_id).length || 0;
    return { ...dept, teamCount };
  }) || [];

  // Sort by team count (largest first)
  const sortedDepartments = departmentsWithCounts.sort((a, b) => b.teamCount - a.teamCount);

  // Calculate total stats
  const totalDepartments = departments?.length || 0;
  const totalPeople = people?.length || 0;
  const avgTeamSize = totalDepartments > 0 ? Math.round(totalPeople / totalDepartments) : 0;
  const largestDept = sortedDepartments[0]?.teamCount || 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Department Overview
        </h2>
        <p className="text-gray-600">
          Monitor team sizes and organizational structure across all departments.
        </p>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-blue-500 mb-2">
            <Building2 size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalDepartments}</p>
          <p className="text-sm text-gray-600">Total Departments</p>
        </Card>
        <Card className="text-center">
          <div className="text-green-500 mb-2">
            <Users size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPeople}</p>
          <p className="text-sm text-gray-600">Total Team Members</p>
        </Card>
        <Card className="text-center">
          <div className="text-amber-500 mb-2">
            <BarChart3 size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgTeamSize}</p>
          <p className="text-sm text-gray-600">Average Team Size</p>
        </Card>
        <Card className="text-center">
          <div className="text-purple-500 mb-2">
            <TrendingUp size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{largestDept}</p>
          <p className="text-sm text-gray-600">Largest Department</p>
        </Card>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedDepartments.map((dept) => (
          <Card key={dept.department_id} className="hover:shadow-md transition-shadow duration-200">
            {/* Department Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{dept.department_name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{dept.description}</p>
              </div>
              <Badge variant="outline" className="text-sm">
                {dept.teamCount} members
              </Badge>
            </div>

            {/* Team Size Indicator */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Team Size</span>
                <span className="text-sm text-gray-500">{dept.teamCount} people</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${largestDept > 0 ? (dept.teamCount / largestDept) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Department Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Building2 size={14} />
                <span>Department ID: {dept.department_id}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={14} />
                <span>Created: {new Date(dept.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Team Size Category */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Size Category</span>
                <Badge 
                  className={`text-xs ${
                    dept.teamCount >= 10 ? 'bg-red-100 text-red-800' :
                    dept.teamCount >= 5 ? 'bg-yellow-100 text-yellow-800' :
                    dept.teamCount >= 2 ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {dept.teamCount >= 10 ? 'Large' :
                   dept.teamCount >= 5 ? 'Medium' :
                   dept.teamCount >= 2 ? 'Small' : 'Micro'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {departments?.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building2 size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Departments Found</h3>
          <p className="text-gray-600">Get started by creating your first department.</p>
        </Card>
      )}

      {/* Organizational Chart Info */}
      {departments && departments.length > 0 && (
        <div className="mt-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizational Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Department Distribution</h4>
                <div className="space-y-2">
                  {sortedDepartments.slice(0, 5).map((dept) => (
                    <div key={dept.department_id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{dept.department_name}</span>
                      <span className="text-gray-500">{dept.teamCount} people</span>
                    </div>
                  ))}
                  {sortedDepartments.length > 5 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      +{sortedDepartments.length - 5} more departments
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Team Size Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Micro Teams (1 person)</span>
                    <span className="text-gray-500">
                      {sortedDepartments.filter(d => d.teamCount === 1).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Small Teams (2-4 people)</span>
                    <span className="text-gray-500">
                      {sortedDepartments.filter(d => d.teamCount >= 2 && d.teamCount <= 4).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Medium Teams (5-9 people)</span>
                    <span className="text-gray-500">
                      {sortedDepartments.filter(d => d.teamCount >= 5 && d.teamCount <= 9).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Large Teams (10+ people)</span>
                    <span className="text-gray-500">
                      {sortedDepartments.filter(d => d.teamCount >= 10).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DepartmentsView;
