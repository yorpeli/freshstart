import { Users, Building2, TrendingUp, UserCheck } from 'lucide-react';
import Card from '../../../ui/Card';
import type { Person } from '../../../../lib/types';

interface TeamStatsCardsProps {
  people: Person[];
  departmentCount: number;
}

const TeamStatsCards: React.FC<TeamStatsCardsProps> = ({ people, departmentCount }) => {
  const highlyEngagedCount = people.filter(p => (p.engagement_priority || 0) >= 4).length;
  const highInfluenceCount = people.filter(p => (p.influence_level || 0) >= 4).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="text-center">
        <div className="text-blue-500 mb-2">
          <Users size={24} className="mx-auto" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{people.length}</p>
        <p className="text-sm text-gray-600">Total Team Members</p>
      </Card>

      <Card className="text-center">
        <div className="text-green-500 mb-2">
          <Building2 size={24} className="mx-auto" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{departmentCount}</p>
        <p className="text-sm text-gray-600">Departments</p>
      </Card>

      <Card className="text-center">
        <div className="text-amber-500 mb-2">
          <TrendingUp size={24} className="mx-auto" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{highlyEngagedCount}</p>
        <p className="text-sm text-gray-600">Highly Engaged</p>
      </Card>

      <Card className="text-center">
        <div className="text-purple-500 mb-2">
          <UserCheck size={24} className="mx-auto" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{highInfluenceCount}</p>
        <p className="text-sm text-gray-600">High Influence</p>
      </Card>
    </div>
  );
};

export default TeamStatsCards;