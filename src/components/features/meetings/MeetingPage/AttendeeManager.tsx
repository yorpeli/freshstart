import React, { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  Crown, 
  UserCheck, 
  User, 
  Clock,
  Mail,
  Building,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { useMeetingPermissions } from './useMeetingPermissions';

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
  last_name: string;
  role_in_meeting: 'organizer' | 'required' | 'optional';
  attendance_status: 'invited' | 'accepted' | 'declined' | 'present' | 'absent';
  email: string | null;
  role_title: string | null;
  department_name: string;
}

interface AttendeeManagerProps {
  attendees: Attendee[];
  onAttendeesChange: (attendees: Attendee[]) => void;
  meetingStatus: string;
  meetingId: number;
  className?: string;
}

const AttendeeManager: React.FC<AttendeeManagerProps> = React.memo(({
  attendees,
  onAttendeesChange,
  meetingStatus,
  meetingId,
  className = ''
}) => {
  // Performance optimizations - stable references
  const attendeesRef = useRef<Attendee[]>(attendees);
  const onAttendeesChangeRef = useRef<(attendees: Attendee[]) => void>(onAttendeesChange);
  const meetingStatusRef = useRef<string>(meetingStatus);
  const meetingIdRef = useRef<number>(meetingId);
  
  useEffect(() => {
    attendeesRef.current = attendees;
    onAttendeesChangeRef.current = onAttendeesChange;
    meetingStatusRef.current = meetingStatus;
    meetingIdRef.current = meetingId;
  }, [attendees, onAttendeesChange, meetingStatus, meetingId]);

  // State management
  const [people, setPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Get permissions
  const permissions = useMeetingPermissions(meetingStatus);

  // Fetch people when modal opens
  useEffect(() => {
    if (isOpen && people.length === 0) {
      fetchPeople();
    }
  }, [isOpen, people.length]);

  const fetchPeople = useCallback(async () => {
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
  }, []);

  // Filter people based on search
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

  // Stable callback functions
  const addAttendee = useCallback(async (person: Person, meetingRole: 'organizer' | 'required' | 'optional') => {
    // Check if person is already an attendee
    if (attendeesRef.current.some(attendee => attendee.person_id === person.person_id)) {
      return;
    }

    setSaving(true);
    try {
      const newAttendee: Attendee = {
        person_id: person.person_id,
        first_name: person.first_name || 'Unknown',
        last_name: person.last_name || '',
        email: person.email || null,
        role_title: person.role_title || null,
        department_name: person.departments?.[0]?.department_name || 'Unknown Department',
        role_in_meeting: meetingRole,
        attendance_status: meetingStatusRef.current === 'in-progress' ? 'present' : 'invited'
      };

      // Optimistic update
      const updatedAttendees = [...attendeesRef.current, newAttendee];
      onAttendeesChangeRef.current(updatedAttendees);

      // Save to database
      const { error } = await supabase
        .from('meeting_attendees')
        .insert({
          meeting_id: meetingIdRef.current,
          person_id: person.person_id,
          role_in_meeting: meetingRole,
          attendance_status: newAttendee.attendance_status
        });

      if (error) throw error;

      setSearchTerm(''); // Clear search for next person
    } catch (err) {
      // Revert optimistic update on error
      onAttendeesChangeRef.current(attendeesRef.current);
      setError(err instanceof Error ? err.message : 'Failed to add attendee');
    } finally {
      setSaving(false);
    }
  }, []);

  const removeAttendee = useCallback(async (personId: number) => {
    setSaving(true);
    try {
      // Optimistic update
      const updatedAttendees = attendeesRef.current.filter(attendee => attendee.person_id !== personId);
      onAttendeesChangeRef.current(updatedAttendees);

      // Save to database
      const { error } = await supabase
        .from('meeting_attendees')
        .delete()
        .eq('meeting_id', meetingIdRef.current)
        .eq('person_id', personId);

      if (error) throw error;
    } catch (err) {
      // Revert optimistic update on error
      onAttendeesChangeRef.current(attendeesRef.current);
      setError(err instanceof Error ? err.message : 'Failed to remove attendee');
    } finally {
      setSaving(false);
    }
  }, []);

  const updateAttendeeRole = useCallback(async (personId: number, newRole: 'organizer' | 'required' | 'optional') => {
    setSaving(true);
    try {
      // Optimistic update
      const updatedAttendees = attendeesRef.current.map(attendee => 
        attendee.person_id === personId 
          ? { ...attendee, role_in_meeting: newRole }
          : attendee
      );
      onAttendeesChangeRef.current(updatedAttendees);

      // Save to database
      const { error } = await supabase
        .from('meeting_attendees')
        .update({ role_in_meeting: newRole })
        .eq('meeting_id', meetingIdRef.current)
        .eq('person_id', personId);

      if (error) throw error;
    } catch (err) {
      // Revert optimistic update on error
      onAttendeesChangeRef.current(attendeesRef.current);
      setError(err instanceof Error ? err.message : 'Failed to update attendee role');
    } finally {
      setSaving(false);
    }
  }, []);

  const updateAttendanceStatus = useCallback(async (personId: number, status: 'present' | 'absent') => {
    setSaving(true);
    try {
      // Optimistic update
      const updatedAttendees = attendeesRef.current.map(attendee => 
        attendee.person_id === personId 
          ? { ...attendee, attendance_status: status }
          : attendee
      );
      onAttendeesChangeRef.current(updatedAttendees);

      // Save to database
      const { error } = await supabase
        .from('meeting_attendees')
        .update({ attendance_status: status })
        .eq('meeting_id', meetingIdRef.current)
        .eq('person_id', personId);

      if (error) throw error;
    } catch (err) {
      // Revert optimistic update on error
      onAttendeesChangeRef.current(attendeesRef.current);
      setError(err instanceof Error ? err.message : 'Failed to update attendance');
    } finally {
      setSaving(false);
    }
  }, []);

  // Helper functions
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

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'declined':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status-specific content
  const getStatusMessage = () => {
    if (!permissions.canEditAttendees && meetingStatus === 'in-progress') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Meeting in Progress</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Attendee list is locked during meeting. Only attendance status can be updated.
          </p>
        </div>
      );
    }



    return null;
  };

  const getAttendeeStats = () => {
    const total = attendees.length;
    const organizers = attendees.filter(a => a.role_in_meeting === 'organizer').length;
    const required = attendees.filter(a => a.role_in_meeting === 'required').length;
    const optional = attendees.filter(a => a.role_in_meeting === 'optional').length;
    const present = attendees.filter(a => a.attendance_status === 'present').length;
    const absent = attendees.filter(a => a.attendance_status === 'absent').length;

    return { total, organizers, required, optional, present, absent };
  };

  const stats = getAttendeeStats();





  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Meeting Attendees</h3>
          <span className="text-sm text-gray-500">({stats.total} total)</span>
        </div>
        
        {/* Attendee Stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded border">
            {stats.organizers} organizer{stats.organizers !== 1 ? 's' : ''}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded border">
            {stats.required} required
          </span>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded border">
            {stats.optional} optional
          </span>
          {meetingStatus === 'in-progress' && (
            <>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded border">
                {stats.present} present
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded border">
                {stats.absent} absent
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status Message */}
      {getStatusMessage()}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-xs text-red-700 mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-600 hover:text-red-800 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}


      
      {attendees.length > 0 ? (
        <div className="space-y-3">
          {attendees.map((attendee) => (
            <div key={attendee.person_id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3">
                {getRoleIcon(attendee.role_in_meeting)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {attendee.first_name} {attendee.last_name}
                    </div>
                    {meetingStatus === 'in-progress' && getAttendanceIcon(attendee.attendance_status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {attendee.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{attendee.email}</span>
                      </div>
                    )}
                    {attendee.role_title && (
                      <span className="truncate">{attendee.role_title}</span>
                    )}
                    {attendee.department_name && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate">{attendee.department_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Role Selector */}
                {permissions.canEditAttendees ? (
                  <select
                    value={attendee.role_in_meeting}
                    onChange={(e) => updateAttendeeRole(attendee.person_id, e.target.value as 'organizer' | 'required' | 'optional')}
                    disabled={saving}
                    className={`text-xs px-2 py-1 rounded border ${getRoleColor(attendee.role_in_meeting)} disabled:opacity-50`}
                  >
                    <option value="organizer">Organizer</option>
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                  </select>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded border ${getRoleColor(attendee.role_in_meeting)}`}>
                    {attendee.role_in_meeting}
                  </span>
                )}

                {/* Attendance Status (in-progress meetings only) */}
                {meetingStatus === 'in-progress' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateAttendanceStatus(attendee.person_id, 'present')}
                      disabled={saving || attendee.attendance_status === 'present'}
                      className={`p-1 rounded border text-xs ${
                        attendee.attendance_status === 'present' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700'
                      } disabled:opacity-50`}
                      title="Mark as Present"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => updateAttendanceStatus(attendee.person_id, 'absent')}
                      disabled={saving || attendee.attendance_status === 'absent'}
                      className={`p-1 rounded border text-xs ${
                        attendee.attendance_status === 'absent' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-700'
                      } disabled:opacity-50`}
                      title="Mark as Absent"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Attendance Status Display (non-editable states) */}
                {meetingStatus !== 'in-progress' && attendee.attendance_status && (
                  <span className={`text-xs px-2 py-1 rounded border ${getAttendanceColor(attendee.attendance_status)}`}>
                    {attendee.attendance_status}
                  </span>
                )}

                {/* Remove Button */}
                {permissions.canEditAttendees && (
                  <button
                    type="button"
                    onClick={() => removeAttendee(attendee.person_id)}
                    disabled={saving}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                    title="Remove Attendee"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium">No attendees added yet</p>
          <p className="text-xs text-gray-400 mt-1">
            {permissions.canEditAttendees 
              ? 'Click "Add Attendees" below to invite people to this meeting'
              : 'The organizer hasn\'t added any attendees yet'
            }
          </p>
          {permissions.canEditAttendees && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Your First Attendee
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Attendee Button */}
      {permissions.canEditAttendees && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Attendees
        </button>
      )}

      {/* Attendee Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
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
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading people...</p>
                </div>
              ) : filteredPeople.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchTerm ? `No people found matching "${searchTerm}"` : 'No people available'}
                </div>
              ) : (
                filteredPeople.map((person) => {
                  const isAlreadyAttendee = attendees.some(attendee => attendee.person_id === person.person_id);
                  
                  return (
                    <div key={person.person_id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">
                            {person.first_name || 'Unknown'} {person.last_name || ''}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                            {person.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{person.email}</span>
                              </div>
                            )}
                            {person.role_title && <span>{person.role_title}</span>}
                            {person.departments?.[0]?.department_name && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span>{person.departments[0].department_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isAlreadyAttendee ? (
                          <span className="text-sm text-gray-400">Already added</span>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => addAttendee(person, 'organizer')}
                              disabled={saving}
                              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded border border-yellow-200 hover:bg-yellow-200 disabled:opacity-50"
                            >
                              Add as Organizer
                            </button>
                            <button
                              type="button"
                              onClick={() => addAttendee(person, 'required')}
                              disabled={saving}
                              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded border border-green-200 hover:bg-green-200 disabled:opacity-50"
                            >
                              Add as Required
                            </button>
                            <button
                              type="button"
                              onClick={() => addAttendee(person, 'optional')}
                              disabled={saving}
                              className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded border border-gray-200 hover:bg-gray-200 disabled:opacity-50"
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

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{filteredPeople.length} people shown</span>
                {saving && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    <span>Saving...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

AttendeeManager.displayName = 'AttendeeManager';

export default AttendeeManager;