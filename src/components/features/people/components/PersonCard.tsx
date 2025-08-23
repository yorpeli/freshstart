import Badge from '../../../ui/Badge';
import { UserCheck, UserMinus, UserX } from 'lucide-react';
import type { Person } from '../../../../lib/types';

interface PersonCardProps {
  person: Person;
}

const PersonCard: React.FC<PersonCardProps> = ({ person }) => {
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

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Person Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">
            {person.first_name} {person.last_name}
          </h4>
          <p className="text-sm text-gray-600">{person.role_title}</p>
        </div>
        <div className="text-right">
          <Badge className={`text-xs ${getInfluenceColor(person.influence_level || 0)}`}>
            Influence: {person.influence_level || 0}/5
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
  );
};

export default PersonCard;