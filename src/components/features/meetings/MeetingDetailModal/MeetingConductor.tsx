import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, Clock, Target, MessageSquare, Users, Plus, Save, FileText } from 'lucide-react';
import { supabase } from '../../../../lib/supabase';

interface Meeting {
  meeting_id: number;
  meeting_name: string;
  status: string;
  template_data: any;
  structured_notes: any;
  unstructured_notes: string | null;
  free_form_insights: string | null;
}

interface MeetingConductorProps {
  meeting: Meeting;
  onMeetingUpdate: (updatedData: Partial<Meeting>) => void;
}

interface Attendee {
  person_id: number;
  first_name: string;
  last_name: string;
  role_in_meeting: string;
  attendance_status: string;
}

const MeetingConductor: React.FC<MeetingConductorProps> = ({
  meeting,
  onMeetingUpdate
}) => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [structuredNotes, setStructuredNotes] = useState<any>(meeting.structured_notes || {});
  const [unstructuredNotes, setUnstructuredNotes] = useState(meeting.unstructured_notes || '');
  const [freeFormInsights, setFreeFormInsights] = useState(meeting.free_form_insights || '');
  const [currentSection, setCurrentSection] = useState(0);
  const [isConducting, setIsConducting] = useState(meeting.status === 'in-progress');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendees();
  }, [meeting.meeting_id]);

  const fetchAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_attendees')
        .select(`
          person_id,
          role_in_meeting,
          attendance_status,
          people (
            first_name,
            last_name
          )
        `)
        .eq('meeting_id', meeting.meeting_id);

      if (error) throw error;

             const formattedAttendees = data?.map(item => ({
         person_id: item.person_id,
         first_name: item.people?.[0]?.first_name || 'Unknown',
         last_name: item.people?.[0]?.last_name || '',
         role_in_meeting: item.role_in_meeting,
         attendance_status: item.attendance_status
       })) || [];

      setAttendees(formattedAttendees);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    }
  };

  const startMeeting = async () => {
    try {
      setLoading(true);
      await onMeetingUpdate({ status: 'in-progress' });
      setIsConducting(true);
    } catch (err) {
      console.error('Failed to start meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeMeeting = async () => {
    try {
      setLoading(true);
      await onMeetingUpdate({ status: 'completed' });
      setIsConducting(false);
    } catch (err) {
      console.error('Failed to complete meeting:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = async (personId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('meeting_attendees')
        .update({ attendance_status: status })
        .eq('meeting_id', meeting.meeting_id)
        .eq('person_id', personId);

      if (error) throw error;

      // Update local state
      setAttendees(prev => prev.map(attendee => 
        attendee.person_id === personId 
          ? { ...attendee, attendance_status: status }
          : attendee
      ));
    } catch (err) {
      console.error('Failed to update attendance:', err);
    }
  };

  const updateStructuredNotes = (sectionIndex: number, field: string, value: any) => {
    const newNotes = { ...structuredNotes };
    
    if (!newNotes.agenda_sections) {
      newNotes.agenda_sections = [];
    }
    
    if (!newNotes.agenda_sections[sectionIndex]) {
      newNotes.agenda_sections[sectionIndex] = {};
    }
    
    newNotes.agenda_sections[sectionIndex][field] = value;
    setStructuredNotes(newNotes);
  };

  const updateQuestionResponse = (sectionIndex: number, questionText: string, response: string) => {
    const newNotes = { ...structuredNotes };
    
    if (!newNotes.agenda_sections) {
      newNotes.agenda_sections = [];
    }
    
    if (!newNotes.agenda_sections[sectionIndex]) {
      newNotes.agenda_sections[sectionIndex] = {};
    }
    
    if (!newNotes.agenda_sections[sectionIndex].questions) {
      newNotes.agenda_sections[sectionIndex].questions = [];
    }
    
    // Find existing question response or create new one
    const existingQuestionIndex = newNotes.agenda_sections[sectionIndex].questions.findIndex(
      (q: any) => q.question_text === questionText
    );
    
    if (existingQuestionIndex >= 0) {
      // Update existing response
      newNotes.agenda_sections[sectionIndex].questions[existingQuestionIndex].response = response;
    } else {
      // Create new question response entry
      const newQuestionResponse = {
        question_text: questionText,
        question_hash: `q${sectionIndex}_${Date.now()}`,
        response: response,
        response_timestamp: new Date().toISOString()
      };
      newNotes.agenda_sections[sectionIndex].questions.push(newQuestionResponse);
    }
    
    setStructuredNotes(newNotes);
  };

  const updateTalkingPointNotes = (sectionIndex: number, pointText: string, notes: string) => {
    const newNotes = { ...structuredNotes };
    
    if (!newNotes.agenda_sections) {
      newNotes.agenda_sections = [];
    }
    
    if (!newNotes.agenda_sections[sectionIndex]) {
      newNotes.agenda_sections[sectionIndex] = {};
    }
    
    if (!newNotes.agenda_sections[sectionIndex].talking_points) {
      newNotes.agenda_sections[sectionIndex].talking_points = [];
    }
    
    // Find existing talking point notes or create new one
    const existingPointIndex = newNotes.agenda_sections[sectionIndex].talking_points.findIndex(
      (tp: any) => tp.point_text === pointText
    );
    
    if (existingPointIndex >= 0) {
      // Update existing notes
      newNotes.agenda_sections[sectionIndex].talking_points[existingPointIndex].notes = notes;
    } else {
      // Create new talking point notes entry
      const newTalkingPoint = {
        point_text: pointText,
        point_hash: `tp${sectionIndex}_${Date.now()}`,
        notes: notes,
        notes_timestamp: new Date().toISOString()
      };
      newNotes.agenda_sections[sectionIndex].talking_points.push(newTalkingPoint);
    }
    
    setStructuredNotes(newNotes);
  };

  const getQuestionResponse = (sectionIndex: number, questionText: string) => {
    if (!structuredNotes?.agenda_sections?.[sectionIndex]?.questions) {
      return '';
    }
    
    const question = structuredNotes.agenda_sections[sectionIndex].questions.find(
      (q: any) => q.question_text === questionText
    );
    
    return question?.response || '';
  };

  const getTalkingPointNotes = (sectionIndex: number, pointText: string) => {
    if (!structuredNotes?.agenda_sections?.[sectionIndex]?.talking_points) {
      return '';
    }
    
    const talkingPoint = structuredNotes.agenda_sections[sectionIndex].talking_points.find(
      (tp: any) => tp.point_text === pointText
    );
    
    return talkingPoint?.notes || '';
  };

  const addAgendaNote = (sectionIndex: number, noteText: string) => {
    const newNotes = { ...structuredNotes };
    
    if (!newNotes.agenda_sections) {
      newNotes.agenda_sections = [];
    }
    
    if (!newNotes.agenda_sections[sectionIndex]) {
      newNotes.agenda_sections[sectionIndex] = {};
    }
    
    if (!newNotes.agenda_sections[sectionIndex].notes) {
      newNotes.agenda_sections[sectionIndex].notes = [];
    }
    
         // Add timestamp and note content
     // This creates a structured format like:
     // {
     //   "agenda_sections": [
     //     {
     //       "section": "Context & Background",
     //       "questions": [
     //         {
     //           "question_text": "Walk me through your background and how you got to this role",
     //           "question_hash": "q0_1234567890",
     //           "response": "Sarah has 5 years in fintech...",
     //           "response_timestamp": "2025-01-27T10:30:00.000Z"
     //         }
     //       ],
     //       "talking_points": [
     //         {
     //           "point_text": "Team dynamics are good",
     //           "point_hash": "tp0_1234567890",
     //           "notes": "Everyone seems collaborative...",
     //           "notes_timestamp": "2025-01-27T10:30:00.000Z"
     //         }
     //       ],
     //       "notes": [
     //         {
     //           "id": 1234567890,
     //           "timestamp": "2025-01-27T10:30:00.000Z",
     //           "content": "Key insight about onboarding challenges",
     //           "type": "general_note"
     //         }
     //       ]
     //     }
     //   ]
     // }
    const newNote = {
      id: Date.now(), // Simple unique ID
      timestamp: new Date().toISOString(),
      content: noteText,
      type: 'general_note'
    };
    
    newNotes.agenda_sections[sectionIndex].notes.push(newNote);
    setStructuredNotes(newNotes);
  };

  const removeAgendaNote = (sectionIndex: number, noteId: number) => {
    const newNotes = { ...structuredNotes };
    
    if (newNotes.agenda_sections?.[sectionIndex]?.notes) {
      newNotes.agenda_sections[sectionIndex].notes = newNotes.agenda_sections[sectionIndex].notes.filter(
        (note: any) => note.id !== noteId
      );
      setStructuredNotes(newNotes);
    }
  };

  const exportStructuredNotes = () => {
    const exportData = {
      meeting_name: meeting.meeting_name,
      meeting_id: meeting.meeting_id,
      export_timestamp: new Date().toISOString(),
      structured_notes: structuredNotes
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-notes-${meeting.meeting_id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveNotes = async () => {
    try {
      setLoading(true);
      await onMeetingUpdate({
        structured_notes: structuredNotes,
        unstructured_notes: unstructuredNotes,
        free_form_insights: freeFormInsights
      });
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'invited':
        return 'bg-blue-100 text-blue-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Users className="h-4 w-4 text-yellow-600" />;
      case 'required':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'optional':
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!meeting.template_data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No template structure available for this meeting.</p>
      </div>
    );
  }

  const template = meeting.template_data;
  const agendaSections = template.agenda_sections || [];

  return (
    <div className="space-y-6">
      {/* Meeting Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceStatusColor(meeting.status)}`}>
              {meeting.status}
            </span>
          </div>
          
          {isConducting && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Current Section:</span>
              <span className="text-sm text-gray-900">
                {currentSection + 1} of {agendaSections.length}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isConducting && meeting.status === 'scheduled' && (
            <button
              onClick={startMeeting}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              Start Meeting
            </button>
          )}
          
          {isConducting && (
            <button
              onClick={completeMeeting}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Meeting
            </button>
          )}
          
          <button
            onClick={saveNotes}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Notes
          </button>
          
          <button
            onClick={exportStructuredNotes}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FileText className="h-4 w-4" />
            Export Notes
          </button>
          
          <button
            onClick={() => {
              const debugData = {
                meeting_name: meeting.meeting_name,
                current_structure: structuredNotes,
                preview: "Check console for full structure"
              };
              console.log('Current Structured Notes:', debugData);
              alert('Check browser console to see the current structured notes format');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <MessageSquare className="h-4 w-4" />
            Debug Structure
          </button>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Meeting Attendees</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attendees.map((attendee) => (
            <div key={attendee.person_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getRoleIcon(attendee.role_in_meeting)}
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {attendee.first_name} {attendee.last_name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {attendee.role_in_meeting}
                  </div>
                </div>
              </div>
              
              <select
                value={attendee.attendance_status}
                onChange={(e) => updateAttendanceStatus(attendee.person_id, e.target.value)}
                className={`text-xs px-2 py-1 rounded border ${getAttendanceStatusColor(attendee.attendance_status)}`}
              >
                <option value="invited">Invited</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Agenda Sections */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Meeting Agenda</h3>
        
        {agendaSections.map((section: any, index: number) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{section.time_minutes || 0} min</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900">{section.section}</h4>
              </div>
              
              {isConducting && (
                <button
                  onClick={() => setCurrentSection(index)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentSection === index
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {currentSection === index ? 'Current' : 'Go to'}
                </button>
              )}
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600">{section.purpose}</p>
            </div>

            {/* Questions or Talking Points */}
            {section.questions && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Questions:</h5>
                <div className="space-y-2">
                  {section.questions.map((question: string, qIndex: number) => (
                    <div key={qIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{question}</p>
                                                 <div className="mt-2">
                           <textarea
                             value={getQuestionResponse(index, question)}
                             onChange={(e) => updateQuestionResponse(index, question, e.target.value)}
                             rows={2}
                             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                             placeholder="Add response..."
                           />
                           <div className="text-xs text-gray-500 mt-1">
                             Response to: "{question}"
                           </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section.talking_points && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Talking Points:</h5>
                <div className="space-y-2">
                  {section.talking_points.map((point: string, pIndex: number) => (
                    <div key={pIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{point}</p>
                                                 <div className="mt-2">
                           <textarea
                             value={getTalkingPointNotes(index, point)}
                             onChange={(e) => updateTalkingPointNotes(index, point, e.target.value)}
                             rows={2}
                             className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                             placeholder="Add notes..."
                           />
                           <div className="text-xs text-gray-500 mt-1">
                             Notes on: "{point}"
                           </div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Notes for Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Section Notes
                </label>
                <button
                  onClick={() => {
                    const noteText = prompt('Add a note for this agenda section:');
                    if (noteText && noteText.trim()) {
                      addAgendaNote(index, noteText.trim());
                    }
                  }}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  + Add Note
                </button>
              </div>
              
              {/* Display existing notes */}
              {structuredNotes?.agenda_sections?.[index]?.notes && 
               structuredNotes.agenda_sections[index].notes.length > 0 ? (
                <div className="space-y-2">
                  {structuredNotes.agenda_sections[index].notes.map((note: any) => (
                    <div key={note.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(note.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-gray-900">{note.content}</div>
                      </div>
                      <button
                        onClick={() => removeAgendaNote(index, note.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No notes added yet. Click "Add Note" to capture insights for this section.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Free-form Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Unstructured Notes</h3>
          <textarea
            value={unstructuredNotes}
            onChange={(e) => setUnstructuredNotes(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Capture any additional notes, observations, or transcriptions..."
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Free-form Insights</h3>
          <textarea
            value={freeFormInsights}
            onChange={(e) => setFreeFormInsights(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Capture random insights, ideas, or observations..."
          />
        </div>
      </div>
    </div>
  );
};

export default MeetingConductor;
