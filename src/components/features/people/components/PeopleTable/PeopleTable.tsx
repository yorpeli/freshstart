import React from 'react';
import Card from '../../../../ui/Card';
import PeopleTableHeader from './PeopleTableHeader';
import PersonRow from './PersonRow';
import type { Person } from '../../../../../lib/types';

interface PeopleTableProps {
  people: Person[];
  onPersonClick: (person: Person) => void;
}

const PeopleTable: React.FC<PeopleTableProps> = ({ people, onPersonClick }) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <PeopleTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {people.map((person) => (
              <PersonRow key={person.person_id} person={person} onClick={onPersonClick} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PeopleTable;