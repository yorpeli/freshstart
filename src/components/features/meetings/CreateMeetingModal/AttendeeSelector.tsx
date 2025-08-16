import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Users, Search, Plus, X, Crown, UserCheck, User } from 'lucide-react';

interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_title: string;
  department_id: number;
  departments: {
    department_name: string;
  }[];
}

interface Attendee {
  person_id: number;
  first_name: string;
  last_name: string | null;
  email: string | null;
  role_title: string | null;
  department_id: number | null;
  department_name: string;
  role_in_meeting: 'organizer' | 'required' | 'optional';
}

interface AttendeeSelectorProps {
  attendees: Attendee[];
  onAttendeesChange: (attendees: Attendee[]) => void;
}

const AttendeeSelector: React.FC<AttendeeSelectorProps> = ({
  attendees,
  onAttendeesChange
}) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('people')
        .select('person_id, first_name, last_name, email, role_title, department_id, departments(department_name)')
        .order('last_name')
        .order('first_name');

      if (error) throw error;
      setPeople(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch people');
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = people.filter(person => {
    const fullName = `${person.first_name || ''} ${person.last_name || ''}`.toLowerCase();
    const email = (person.email || '').toLowerCase();
    const role = (person.role_title || '').toLowerCase();
    const department = person.departments?.[0]?.department_name?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase()) ||
           role.includes(searchTerm.toLowerCase()) ||
           department.includes(searchTerm.toLowerCase());
  });

  const addAttendee = (person: Person, meetingRole: 'organizer' | 'required' | 'optional') => {
    // Check if person is already an attendee
    if (attendees.some(attendee => attendee.person_id === person.person_id)) {
      return;
    }

    const newAttendee: Attendee = {
      person_id: person.person_id,
      first_name: person.first_name || 'Unknown',
      last_name: person.last_name || null,
      email: person.email || null,
      role_title: person.role_title || null,
      department_id: person.department_id || null,
      department_name: person.departments?.[0]?.department_name || 'Unknown Department',
      role_in_meeting: meetingRole
    };

    onAttendeesChange([...attendees, newAttendee]);
    // Remove the automatic modal closing - let users add multiple people
    // setIsOpen(false);
    setSearchTerm(''); // Clear search term for next search
  };

  const removeAttendee = (personId: number) => {
    onAttendeesChange(attendees.filter(attendee => attendee.person_id !== personId));
  };

  const updateAttendeeRole = (personId: number, newRole: 'organizer' | 'required' | 'optional') => {
    onAttendeesChange(attendees.map(attendee => 
      attendee.person_id === personId 
        ? { ...attendee, role_in_meeting: newRole }
        : attendee
    ));
  };

  const getRoleIcon = (role: 'organizer' | 'required' | 'optional') => {
    switch (role) {
      case 'organizer':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'required':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'optional':
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: 'organizer' | 'required' | 'optional') => {
    switch (role) {
      case 'organizer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'required':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'optional':
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error loading people: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Meeting Attendees
      </label>

      {/* Current Attendees */}
      {attendees.length > 0 && (
        <div className="space-y-2">
          {attendees.map((attendee) => (
            <div key={attendee.person_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                {getRoleIcon(attendee.role_in_meeting)}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {attendee.first_name} {attendee.last_name || ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    {attendee.email || 'No email'} • {attendee.role_title || 'No role'} • {attendee.department_name || 'Unknown Department'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={attendee.role_in_meeting}
                  onChange={(e) => updateAttendeeRole(attendee.person_id, e.target.value as 'organizer' | 'required' | 'optional')}
                  className={`text-xs px-2 py-1 rounded border ${getRoleColor(attendee.role_in_meeting)}`}
                >
                  <option value="organizer">Organizer</option>
                  <option value="required">Required</option>
                  <option value="optional">Optional</option>
                </select>
                
                <button
                  type="button"
                  onClick={() => removeAttendee(attendee.person_id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Attendee Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Plus className="h-4 w-4" />
        Add Attendee
      </button>

      {/* Attendee Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Meeting Attendees</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search people by name, email, role, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* People List */}
            <div className="max-h-96 overflow-auto">
              {filteredPeople.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No people found matching "{searchTerm}"
                </div>
              ) : (
                filteredPeople.map((person) => {
                  const isAlreadyAttendee = attendees.some(attendee => attendee.person_id === person.person_id);
                  
                  return (
                    <div key={person.person_id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {person.first_name || 'Unknown'} {person.last_name || ''}
                          </div>
                          <div className="text-sm text-gray-500">
                            {person.email || 'No email'} • {person.role_title || 'No role'} • {person.departments?.[0]?.department_name || 'Unknown Department'}
                          </div>
                        </div>
                        
                        {isAlreadyAttendee ? (
                          <span className="text-sm text-gray-400">Already added</span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => addAttendee(person, 'organizer')}
                              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded border border-yellow-200 hover:bg-yellow-200"
                            >
                              Add as Organizer
                            </button>
                            <button
                              type="button"
                              onClick={() => addAttendee(person, 'required')}
                              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded border border-green-200 hover:bg-green-200"
                            >
                              Add as Required
                            </button>
                            <button
                              type="button"
                              onClick={() => addAttendee(person, 'optional')}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded border border-gray-200 hover:bg-gray-200"
                            >
                              Add as Optional
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeSelector;
