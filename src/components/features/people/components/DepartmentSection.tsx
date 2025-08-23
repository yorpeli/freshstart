import { Building2 } from 'lucide-react';
import Card from '../../../ui/Card';
import Badge from '../../../ui/Badge';
import PersonCard from './PersonCard';
import type { Person } from '../../../../lib/types';

interface DepartmentSectionProps {
  departmentName: string;
  people: Person[];
}

const DepartmentSection: React.FC<DepartmentSectionProps> = ({ departmentName, people }) => {
  return (
    <Card className="mb-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Building2 size={20} className="text-blue-500 mr-2" />
          {departmentName}
          <Badge variant="outline" className="ml-3">
            {people.length} members
          </Badge>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {people.map((person) => (
          <PersonCard key={person.person_id} person={person} />
        ))}
      </div>
    </Card>
  );
};

export default DepartmentSection;