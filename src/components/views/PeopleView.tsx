
import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState, ViewHeader } from '../shared';
import { DepartmentSection, PeopleTable, ViewToggle, PeopleFilters, PersonDetailModal, usePeopleData, usePeopleFilters } from '../features/people';
import type { Person } from '../../lib/types';

const PeopleView: React.FC = () => {
  const { people, isLoading, error } = usePeopleData();
  const { filters, filteredPeople, peopleByDepartment, updateFilters } = usePeopleFilters(people);
  const [currentView, setCurrentView] = useState<'cards' | 'table'>('table');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handlePersonClick = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleCloseModal = () => {
    setSelectedPerson(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <ViewHeader
          title="Team Management"
          description="View team structure, reporting relationships, and engagement metrics across all departments."
        />
        <LoadingState count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ViewHeader
          title="Team Management"
          description="View team structure, reporting relationships, and engagement metrics across all departments."
        />
        <ErrorState
          error={error}
          title="Error Loading Team"
        />
      </div>
    );
  }

  if (filteredPeople.length === 0 && people.length === 0) {
    return (
      <div className="p-6">
        <ViewHeader
          title="Team Management"
          description="View team structure, reporting relationships, and engagement metrics across all departments."
        />
        <EmptyState
          title="No Team Members Found"
          description="Get started by adding your first team member."
          icon={<Users size={48} className="mx-auto" />}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <ViewHeader
          title="Team Management"
          description="View team structure, reporting relationships, and engagement metrics across all departments."
        />
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      </div>

      <div className="mb-6">
        <PeopleFilters filters={filters} onFiltersChange={updateFilters} />
      </div>

      {filteredPeople.length === 0 && people.length > 0 ? (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matching people found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      ) : currentView === 'cards' ? (
        Object.entries(peopleByDepartment).map(([deptName, deptPeople]) => (
          <DepartmentSection key={deptName} departmentName={deptName} people={deptPeople} />
        ))
      ) : (
        <PeopleTable people={filteredPeople} onPersonClick={handlePersonClick} />
      )}

      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          isOpen={!!selectedPerson}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PeopleView;
