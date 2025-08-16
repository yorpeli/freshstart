
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { usePeopleWithRelations } from '../../hooks/useSupabaseQuery';
import { Users, Building2, TrendingUp, UserCheck, UserX, UserMinus } from 'lucide-react';

const PeopleView: React.FC = () => {
  const { data: people, isLoading, error } = usePeopleWithRelations();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            <Users size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Team</h3>
          <p className="text-gray-600">{error.message}</p>
        </Card>
      </div>
    );
  }

  const getEngagementIcon = (level: number) => {
    if (level >= 4) return <UserCheck size={16} className="text-green-500" />;
    if (level >= 3) return <UserMinus size={16} className="text-yellow-500" />;
    return <UserX size={16} className="text-red-500" />;
  };

  const getEngagementColor = (level: number) => {
    if (level >= 4) return 'text-green-600 bg-green-50';
    if (level >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getInfluenceColor = (level: number) => {
    if (level >= 4) return 'bg-purple-100 text-purple-800';
    if (level >= 3) return 'bg-blue-100 text-blue-800';
    if (level >= 2) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Group people by department
  const peopleByDepartment = people?.reduce((acc, person) => {
    const deptName = person.department?.department_name || 'Unknown Department';
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(person);
    return acc;
  }, {} as Record<string, typeof people>) || {};

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Team Management
        </h2>
        <p className="text-gray-600">
          View team structure, reporting relationships, and engagement metrics across all departments.
        </p>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center">
          <div className="text-blue-500 mb-2">
            <Users size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{people?.length || 0}</p>
          <p className="text-sm text-gray-600">Total Team Members</p>
        </Card>
        <Card className="text-center">
          <div className="text-green-500 mb-2">
            <Building2 size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{Object.keys(peopleByDepartment).length}</p>
          <p className="text-sm text-gray-600">Departments</p>
        </Card>
        <Card className="text-center">
          <div className="text-amber-500 mb-2">
            <TrendingUp size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {people?.filter(p => (p.engagement_priority || 0) >= 4).length || 0}
          </p>
          <p className="text-sm text-gray-600">Highly Engaged</p>
        </Card>
        <Card className="text-center">
          <div className="text-purple-500 mb-2">
            <UserCheck size={24} className="mx-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {people?.filter(p => p.influence_level >= 4).length || 0}
          </p>
          <p className="text-sm text-gray-600">High Influence</p>
        </Card>
      </div>

      {/* Department Sections */}
      {Object.entries(peopleByDepartment).map(([deptName, deptPeople]) => (
        <Card key={deptName} className="mb-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Building2 size={20} className="text-blue-500 mr-2" />
              {deptName}
              <Badge variant="outline" className="ml-3">
                {deptPeople.length} members
              </Badge>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {deptPeople.map((person) => (
              <div 
                key={person.person_id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                {/* Person Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {person.first_name} {person.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">{person.role_title}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-xs ${getInfluenceColor(person.influence_level)}`}>
                      Influence: {person.influence_level}/5
                    </Badge>
                  </div>
                </div>

                {/* Engagement Level */}
                <div className="flex items-center space-x-2 mb-3">
                  {getEngagementIcon(person.engagement_priority || 0)}
                  <span className={`text-xs px-2 py-1 rounded-full ${getEngagementColor(person.engagement_priority || 0)}`}>
                    Engagement: {person.engagement_priority || 0}/5
                  </span>
                </div>

                {/* Reporting Relationship */}
                <div className="text-sm text-gray-600 mb-3">
                  {person.reports_to ? (
                    <span>
                      Reports to: <span className="font-medium">{person.reports_to.first_name} {person.reports_to.last_name}</span>
                      {person.reports_to.role_title && (
                        <span className="text-gray-500"> ({person.reports_to.role_title})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-500">No direct manager</span>
                  )}
                </div>

                {/* Direct Reports */}
                {person.direct_reports && person.direct_reports.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Direct Reports:</span>
                    <div className="mt-1 space-y-1">
                      {person.direct_reports.map((report) => (
                        <div key={report.person_id} className="flex items-center space-x-2 text-xs">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>{report.first_name} {report.last_name}</span>
                          <span className="text-gray-500">({report.role_title})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Person ID */}
                <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                  ID: {person.person_id}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Empty State */}
      {people?.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Found</h3>
          <p className="text-gray-600">Get started by adding your first team member.</p>
        </Card>
      )}
    </div>
  );
};

export default PeopleView;
