import React from 'react';
import type { Person } from '../../../../../lib/types';

interface PersonRowProps {
  person: Person;
  onClick: (person: Person) => void;
}

const PersonRow: React.FC<PersonRowProps> = ({ person, onClick }) => {

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => onClick(person)}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {person.first_name} {person.last_name}
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {person.role_title}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {person.department?.department_name || 'Unknown'}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {person.reports_to ? (
            `${person.reports_to.first_name} ${person.reports_to.last_name}`
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {person.direct_reports && person.direct_reports.length > 0 ? (
            `${person.direct_reports.length} report${person.direct_reports.length > 1 ? 's' : ''}`
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PersonRow;