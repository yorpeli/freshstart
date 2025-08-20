import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Clock, Plus, X, Save, FileText, Layout, Columns, Maximize2 } from 'lucide-react';
import DebouncedInput from './DebouncedInput';

// Types for structured notes following the MeetingConductor pattern
interface QuestionResponse {
  question_text: string;
  question_hash: string;
  response: string;
  response_timestamp: string;
}

interface TalkingPointNote {
  point_text: string;
  point_hash: string;
  notes: string;
  notes_timestamp: string;
}

interface SectionNote {
  id: number;
  timestamp: string;
  content: string;
  type: 'general_note';
}

interface AgendaSectionNotes {
  section: string;
  questions?: QuestionResponse[];
  talking_points?: TalkingPointNote[];
  notes?: SectionNote[];
}

interface StructuredNotes {
  agenda_sections?: AgendaSectionNotes[];
}

interface NotesManagerProps {
  meeting: {
    meeting_id: number;
    meeting_name: string;
    template_data: any;
    structured_notes: any;
    unstructured_notes: string | null;
    free_form_insights: string | null;
    meeting_summary: string | null;
    overall_assessment: string | null;
  };
  onNotesUpdate: (updates: {
    structured_notes?: StructuredNotes;
    unstructured_notes?: string;
    free_form_insights?: string;
    meeting_summary?: string;
    overall_assessment?: string;
  }) => void;
  canTakeNotes: boolean;
  canEditNotes: boolean;
}

type NotesTab = 'agenda' | 'transcription' | 'insights' | 'summary';
type LayoutMode = 'tabs' | 'split' | 'focus';

// Performance Optimization 1: Memoized components for expensive sections
const AgendaSectionNotesItem = React.memo<{
  section: any;
  sectionIndex: number;
  structuredNotes: StructuredNotes;
  canEdit: boolean;
  onQuestionResponse: (sectionIndex: number, questionText: string, response: string) => void;
  onTalkingPointNotes: (sectionIndex: number, pointText: string, notes: string) => void;
  onAddNote: (sectionIndex: number, noteText: string) => void;
  onRemoveNote: (sectionIndex: number, noteId: number) => void;
}>(({ 
  section, 
  sectionIndex, 
  structuredNotes, 
  canEdit, 
  onQuestionResponse, 
  onTalkingPointNotes, 
  onAddNote, 
  onRemoveNote 
}) => {
  // Helper functions with stable references using refs
  const getQuestionResponse = useCallback((questionText: string): string => {
    if (!structuredNotes?.agenda_sections?.[sectionIndex]?.questions) {
      return '';
    }
    
    const question = structuredNotes.agenda_sections[sectionIndex].questions!.find(
      (q: QuestionResponse) => q.question_text === questionText
    );
    
    return question?.response || '';
  }, [structuredNotes, sectionIndex]);

  const getTalkingPointNotes = useCallback((pointText: string): string => {
    if (!structuredNotes?.agenda_sections?.[sectionIndex]?.talking_points) {
      return '';
    }
    
    const talkingPoint = structuredNotes.agenda_sections[sectionIndex].talking_points!.find(
      (tp: TalkingPointNote) => tp.point_text === pointText
    );
    
    return talkingPoint?.notes || '';
  }, [structuredNotes, sectionIndex]);

  // Stable callback references using refs
  const onQuestionResponseRef = useRef(onQuestionResponse);
  const onTalkingPointNotesRef = useRef(onTalkingPointNotes);
  const onAddNoteRef = useRef(onAddNote);
  const onRemoveNoteRef = useRef(onRemoveNote);

  useEffect(() => {
    onQuestionResponseRef.current = onQuestionResponse;
    onTalkingPointNotesRef.current = onTalkingPointNotes;
    onAddNoteRef.current = onAddNote;
    onRemoveNoteRef.current = onRemoveNote;
  }, [onQuestionResponse, onTalkingPointNotes, onAddNote, onRemoveNote]);

  // Stable callbacks with empty dependencies
  const handleQuestionResponse = useCallback((questionText: string, response: string) => {
    onQuestionResponseRef.current(sectionIndex, questionText, response);
  }, [sectionIndex]);

  const handleTalkingPointNotes = useCallback((pointText: string, notes: string) => {
    onTalkingPointNotesRef.current(sectionIndex, pointText, notes);
  }, [sectionIndex]);

  const handleAddNote = useCallback(() => {
    const noteText = prompt('Add a note for this agenda section:');
    if (noteText && noteText.trim()) {
      onAddNoteRef.current(sectionIndex, noteText.trim());
    }
  }, [sectionIndex]);

  const handleRemoveNote = useCallback((noteId: number) => {
    onRemoveNoteRef.current(sectionIndex, noteId);
  }, [sectionIndex]);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">{section.time_minutes || 0} min</span>
        </div>
        <h5 className="text-lg font-medium text-gray-900">{section.section}</h5>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-600">{section.purpose}</p>
      </div>

      {/* Questions */}
      {section.questions && section.questions.length > 0 && (
        <div className="mb-4">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Questions:</h6>
          <div className="space-y-3">
            {section.questions.map((question: string, qIndex: number) => (
              <div key={qIndex} className="border-l-2 border-blue-200 pl-4">
                <p className="text-sm text-gray-900 mb-2">{question}</p>
                <DebouncedInput
                  type="textarea"
                  rows={2}
                  value={getQuestionResponse(question)}
                  onChange={(response) => handleQuestionResponse(question, response)}
                  disabled={!canEdit}
                  placeholder={canEdit ? "Add response..." : "No response recorded"}
                  debounceMs={500}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talking Points */}
      {section.talking_points && section.talking_points.length > 0 && (
        <div className="mb-4">
          <h6 className="text-sm font-medium text-gray-700 mb-2">Talking Points:</h6>
          <div className="space-y-3">
            {section.talking_points.map((point: string, pIndex: number) => (
              <div key={pIndex} className="border-l-2 border-green-200 pl-4">
                <p className="text-sm text-gray-900 mb-2">{point}</p>
                <DebouncedInput
                  type="textarea"
                  rows={2}
                  value={getTalkingPointNotes(point)}
                  onChange={(notes) => handleTalkingPointNotes(point, notes)}
                  disabled={!canEdit}
                  placeholder={canEdit ? "Add notes..." : "No notes recorded"}
                  debounceMs={500}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Notes */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Section Notes
          </label>
          {canEdit && (
            <button
              onClick={handleAddNote}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              <Plus className="h-3 w-3" />
              Add Note
            </button>
          )}
        </div>
        
        {/* Display existing notes */}
        {structuredNotes?.agenda_sections?.[sectionIndex]?.notes && 
         structuredNotes.agenda_sections[sectionIndex].notes!.length > 0 ? (
          <div className="space-y-2">
            {structuredNotes.agenda_sections[sectionIndex].notes!.map((note: SectionNote) => (
              <div key={note.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded border">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(note.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-900">{note.content}</div>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveNote(note.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
            {canEdit ? 'No notes added yet. Click "Add Note" to capture insights for this section.' : 'No notes recorded for this section.'}
          </div>
        )}
      </div>
    </div>
  );
});

AgendaSectionNotesItem.displayName = 'AgendaSectionNotesItem';

const NotesManager: React.FC<NotesManagerProps> = ({
  meeting,
  onNotesUpdate,
  canTakeNotes,
  canEditNotes
}) => {
  // Performance Optimization 5: Local state management with smart prop synchronization
  const [structuredNotes, setStructuredNotes] = useState<StructuredNotes>(meeting.structured_notes || {});
  const [unstructuredNotes, setUnstructuredNotes] = useState(meeting.unstructured_notes || '');
  const [freeFormInsights, setFreeFormInsights] = useState(meeting.free_form_insights || '');
  const [meetingSummary, setMeetingSummary] = useState(meeting.meeting_summary || '');
  const [overallAssessment, setOverallAssessment] = useState(meeting.overall_assessment || '');
  
  const [activeTab, setActiveTab] = useState<NotesTab>('agenda');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    // Load layout preference from localStorage
    try {
      const saved = localStorage.getItem('meeting-notes-layout');
      return (saved as LayoutMode) || 'tabs';
    } catch {
      return 'tabs';
    }
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  
  // Performance Optimization 4: Extended debounce for database saves (30 seconds)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  // Performance Optimization 2: Stable callback references using refs
  const onNotesUpdateRef = useRef(onNotesUpdate);
  const canEditRef = useRef(canTakeNotes || canEditNotes);

  useEffect(() => {
    onNotesUpdateRef.current = onNotesUpdate;
    canEditRef.current = canTakeNotes || canEditNotes;
  }, [onNotesUpdate, canTakeNotes, canEditNotes]);

  // Smart sync with props to prevent infinite loops
  const prevMeetingRef = useRef(meeting);
  useEffect(() => {
    const prevMeeting = prevMeetingRef.current;
    
    if (meeting.structured_notes !== prevMeeting.structured_notes) {
      setStructuredNotes(meeting.structured_notes || {});
    }
    if (meeting.unstructured_notes !== prevMeeting.unstructured_notes) {
      setUnstructuredNotes(meeting.unstructured_notes || '');
    }
    if (meeting.free_form_insights !== prevMeeting.free_form_insights) {
      setFreeFormInsights(meeting.free_form_insights || '');
    }
    if (meeting.meeting_summary !== prevMeeting.meeting_summary) {
      setMeetingSummary(meeting.meeting_summary || '');
    }
    if (meeting.overall_assessment !== prevMeeting.overall_assessment) {
      setOverallAssessment(meeting.overall_assessment || '');
    }
    
    prevMeetingRef.current = meeting;
  }, [meeting]);

  // Check if user can edit based on permissions
  const canEdit = canTakeNotes || canEditNotes;

  // Performance Optimization 4: Auto-save function with extended debounce
  const autoSave = useCallback(() => {
    if (!hasUnsavedChanges || !canEditRef.current) return;

    setIsAutoSaving(true);
    onNotesUpdateRef.current({
      structured_notes: structuredNotes,
      unstructured_notes: unstructuredNotes,
      free_form_insights: freeFormInsights,
      meeting_summary: meetingSummary,
      overall_assessment: overallAssessment
    });
    
    setHasUnsavedChanges(false);
    lastSaveRef.current = Date.now();
    setIsAutoSaving(false);
  }, [
    hasUnsavedChanges, 
    structuredNotes, 
    unstructuredNotes, 
    freeFormInsights, 
    meetingSummary, 
    overallAssessment
  ]);

  // Debounced auto-save (30 seconds as per plan)
  const triggerAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 30000); // 30 seconds
  }, [autoSave]);

  // Manual save with immediate execution
  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    autoSave();
  }, [autoSave]);

  // Mark changes and trigger auto-save
  const markChanges = useCallback(() => {
    setHasUnsavedChanges(true);
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Performance Optimization 2: Stable callbacks with empty dependencies
  const updateQuestionResponse = useCallback((sectionIndex: number, questionText: string, response: string) => {
    const newNotes = { ...structuredNotes };
    
    if (!newNotes.agenda_sections) {
      newNotes.agenda_sections = [];
    }
    
    if (!newNotes.agenda_sections[sectionIndex]) {
      newNotes.agenda_sections[sectionIndex] = { section: meeting.template_data?.agenda_sections?.[sectionIndex]?.section || '' };
    }
    
    if (!newNotes.agenda_sections[sectionIndex].questions) {
      newNotes.agenda_sections[sectionIndex].questions = [];
    }
    
    // Find existing question response or create new one
    const existingQuestionIndex = newNotes.agenda_sections[sectionIndex].questions!.findIndex(
      (q: QuestionResponse) => q.question_text === questionText
    );
    
    if (existingQuestionIndex >= 0) {
      // Update existing response
      newNotes.agenda_sections[sectionIndex].questions![existingQuestionIndex].response = response;
    } else {
      // Create new question response entry
      const newQuestionResponse: QuestionResponse = {
        question_text: questionText,
        question_hash: `q${sectionIndex}_${Date.now()}`,
        response: response,
        response_timestamp: new Date().toISOString()
      };
      newNotes.agenda_sections[sectionIndex].questions!.push(newQuestionResponse);
    }
    
    setStructuredNotes(newNotes);
    markChanges();
  }, []);

  const updateTalkingPointNotes = useCallback((sectionIndex: number, pointText: string, notes: string) => {
    const newNotes = { ...structuredNotes };
    
    if (!newNotes.agenda_sections) {
      newNotes.agenda_sections = [];
    }
    
    if (!newNotes.agenda_sections[sectionIndex]) {
      newNotes.agenda_sections[sectionIndex] = { section: meeting.template_data?.agenda_sections?.[sectionIndex]?.section || '' };
    }
    
    if (!newNotes.agenda_sections[sectionIndex].talking_points) {
      newNotes.agenda_sections[sectionIndex].talking_points = [];
    }
    
    // Find existing talking point notes or create new one
    const existingPointIndex = newNotes.agenda_sections[sectionIndex].talking_points!.findIndex(
      (tp: TalkingPointNote) => tp.point_text === pointText
    );
    
    if (existingPointIndex >= 0) {
      // Update existing notes
      newNotes.agenda_sections[sectionIndex].talking_points![existingPointIndex].notes = notes;
    } else {
      // Create new talking point notes entry
      const newTalkingPoint: TalkingPointNote = {
        point_text: pointText,
        point_hash: `tp${sectionIndex}_${Date.now()}`,
        notes: notes,
        notes_timestamp: new Date().toISOString()
      };
      newNotes.agenda_sections[sectionIndex].talking_points!.push(newTalkingPoint);
    }
    
    setStructuredNotes(newNotes);
    markChanges();
  }, []);

  const addAgendaNote = useCallback((sectionIndex: number, noteText: string) => {
    const newNotes = { ...structuredNotes };
    
    if (!newNotes.agenda_sections) {
      newNotes.agenda_sections = [];
    }
    
    if (!newNotes.agenda_sections[sectionIndex]) {
      newNotes.agenda_sections[sectionIndex] = { section: meeting.template_data?.agenda_sections?.[sectionIndex]?.section || '' };
    }
    
    if (!newNotes.agenda_sections[sectionIndex].notes) {
      newNotes.agenda_sections[sectionIndex].notes = [];
    }
    
    const newNote: SectionNote = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      content: noteText,
      type: 'general_note'
    };
    
    newNotes.agenda_sections[sectionIndex].notes!.push(newNote);
    setStructuredNotes(newNotes);
    markChanges();
  }, []);

  const removeAgendaNote = useCallback((sectionIndex: number, noteId: number) => {
    const newNotes = { ...structuredNotes };
    
    if (newNotes.agenda_sections?.[sectionIndex]?.notes) {
      newNotes.agenda_sections[sectionIndex].notes = newNotes.agenda_sections[sectionIndex].notes!.filter(
        (note: SectionNote) => note.id !== noteId
      );
      setStructuredNotes(newNotes);
      markChanges();
    }
  }, []);

  // Get template agenda sections
  const agendaSections = useMemo(() => meeting.template_data?.agenda_sections || [], [meeting.template_data?.agenda_sections]);

  // Export functionality
  const exportNotes = useCallback(() => {
    const exportData = {
      meeting_name: meeting.meeting_name,
      meeting_id: meeting.meeting_id,
      export_timestamp: new Date().toISOString(),
      structured_notes: structuredNotes,
      unstructured_notes: unstructuredNotes,
      free_form_insights: freeFormInsights,
      meeting_summary: meetingSummary,
      overall_assessment: overallAssessment
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
  }, [meeting.meeting_name, meeting.meeting_id, structuredNotes, unstructuredNotes, freeFormInsights, meetingSummary, overallAssessment]);

  // Stable callbacks for unstructured notes with debouncing
  const handleUnstructuredNotesChange = useCallback((value: string) => {
    setUnstructuredNotes(value);
    markChanges();
  }, [markChanges]);

  const handleFreeFormInsightsChange = useCallback((value: string) => {
    setFreeFormInsights(value);
    markChanges();
  }, [markChanges]);

  const handleMeetingSummaryChange = useCallback((value: string) => {
    setMeetingSummary(value);
    markChanges();
  }, [markChanges]);

  const handleOverallAssessmentChange = useCallback((value: string) => {
    setOverallAssessment(value);
    markChanges();
  }, [markChanges]);

  const tabs = useMemo(() => [
    { id: 'agenda' as NotesTab, label: 'Agenda', icon: '📋', description: 'Structured notes per agenda section' },
    { id: 'transcription' as NotesTab, label: 'Transcription', icon: '🎤', description: 'Meeting transcription and observations' },
    { id: 'insights' as NotesTab, label: 'Insights', icon: '💡', description: 'Free-form insights and ideas' },
    { id: 'summary' as NotesTab, label: 'Summary', icon: '📝', description: 'Meeting summary and assessment' },
  ], []);

  // Layout control functions
  const toggleLayout = useCallback(() => {
    const newLayout = layoutMode === 'tabs' ? 'split' : layoutMode === 'split' ? 'focus' : 'tabs';
    setLayoutMode(newLayout);
    
    // Save layout preference to localStorage
    try {
      localStorage.setItem('meeting-notes-layout', newLayout);
    } catch {
      // Ignore localStorage errors
    }
  }, [layoutMode]);

  const getLayoutIcon = () => {
    switch (layoutMode) {
      case 'tabs': return <Layout className="h-4 w-4" />;
      case 'split': return <Columns className="h-4 w-4" />;
      case 'focus': return <Maximize2 className="h-4 w-4" />;
    }
  };

  const getLayoutLabel = () => {
    switch (layoutMode) {
      case 'tabs': return 'Tab View';
      case 'split': return 'Split View';
      case 'focus': return 'Focus Mode';
    }
  };

  // Keyboard shortcuts for quick switching
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!canEdit) return;
      
      // Only handle if Cmd/Ctrl is pressed
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('agenda');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('insights');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('transcription');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('summary');
            break;
          case 'd':
            e.preventDefault();
            toggleLayout();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [canEdit, toggleLayout]);

  // Create content renderers for reuse
  const renderAgendaContent = useCallback(() => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Structured Notes by Agenda Section</h4>
        <span className="text-sm text-gray-500">Auto-saves every 30 seconds</span>
      </div>
      
      {agendaSections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No agenda sections available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {agendaSections.map((section: any, index: number) => (
            <AgendaSectionNotesItem
              key={index}
              section={section}
              sectionIndex={index}
              structuredNotes={structuredNotes}
              canEdit={canEdit}
              onQuestionResponse={updateQuestionResponse}
              onTalkingPointNotes={updateTalkingPointNotes}
              onAddNote={addAgendaNote}
              onRemoveNote={removeAgendaNote}
            />
          ))}
        </div>
      )}
    </div>
  ), [agendaSections, structuredNotes, canEdit, updateQuestionResponse, updateTalkingPointNotes, addAgendaNote, removeAgendaNote]);

  const renderInsightsContent = useCallback(() => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-medium text-gray-900">Free-form Insights</h4>
        <div className="text-sm text-gray-500">
          Characters: {freeFormInsights.length}
        </div>
      </div>
      <DebouncedInput
        type="textarea"
        rows={layoutMode === 'split' ? 20 : 12}
        value={freeFormInsights}
        onChange={handleFreeFormInsightsChange}
        disabled={!canEdit}
        placeholder={canEdit ? "🚀 Quick capture: Ideas, connections, insights...\n\n• Key insight from discussion\n• Unexpected discovery\n• Follow-up idea\n• Connection to other projects" : "No insights recorded"}
        debounceMs={1000}
      />
      <div className="text-xs text-gray-500">
        💡 <strong>Pro tip:</strong> Use bullet points for quick capture during live discussions
      </div>
    </div>
  ), [freeFormInsights, handleFreeFormInsightsChange, canEdit, layoutMode]);

  return (
    <div className="space-y-6">
      {/* Notes Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-gray-900">Meeting Notes</h3>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
              {isAutoSaving ? (
                <>
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></div>
                  Saving...
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                  Unsaved changes
                </>
              )}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Layout toggle - available to everyone */}
          <button
            onClick={toggleLayout}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
            title={`Switch to ${layoutMode === 'tabs' ? 'Split View' : layoutMode === 'split' ? 'Focus Mode' : 'Tab View'} (Cmd+D)`}
          >
            {getLayoutIcon()}
            {getLayoutLabel()}
          </button>
          
          {/* Edit-only buttons */}
          {canEdit && (
            <>
              <button
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-3 w-3" />
                Save Now
              </button>
              <button
                onClick={exportNotes}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FileText className="h-3 w-3" />
                Export
              </button>
            </>
          )}
        </div>
      </div>

      {/* Permission Banner */}
      {!canEdit && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-700">
            📖 <strong>Read-only:</strong> Notes cannot be modified for this meeting status.
          </p>
        </div>
      )}

      {canTakeNotes && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            🟢 <strong>Live Meeting:</strong> Taking notes in real-time during this meeting.
          </p>
          {canEdit && (
            <p className="text-xs text-green-700 mt-1">
              ⌨️ <strong>Quick keys:</strong> Cmd+1 (Agenda), Cmd+2 (Insights), Cmd+D (Layout)
            </p>
          )}
        </div>
      )}

      {/* Layout-Aware Content */}
      {layoutMode === 'split' ? (
        /* Split Layout: Agenda + Insights Side by Side */
        <>
          <div className="text-center mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              🔀 Split View Active - Agenda + Insights Side by Side
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel - Structured Agenda */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📋</span>
              <h4 className="text-lg font-medium text-gray-900">Structured Agenda</h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Live</span>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {renderAgendaContent()}
            </div>
          </div>

          {/* Right Panel - Quick Insights */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💡</span>
              <h4 className="text-lg font-medium text-gray-900">Quick Insights</h4>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Capture</span>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {renderInsightsContent()}
            </div>
          </div>
        </div>
        </>
      ) : layoutMode === 'focus' ? (
        /* Focus Mode: Single Active Tab Full Screen */
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Focus Mode</span>
          </div>
          
          <div className="min-h-[60vh]">
            {activeTab === 'agenda' && renderAgendaContent()}
            {activeTab === 'insights' && renderInsightsContent()}
            {activeTab === 'transcription' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Meeting Transcription</h4>
                  <div className="text-sm text-gray-500">
                    Characters: {unstructuredNotes.length}
                  </div>
                </div>
                <DebouncedInput
                  type="textarea"
                  rows={20}
                  value={unstructuredNotes}
                  onChange={handleUnstructuredNotesChange}
                  disabled={!canEdit}
                  placeholder={canEdit ? "Capture meeting transcription, observations, or detailed notes here..." : "No transcription recorded"}
                  debounceMs={1000}
                />
                <div className="text-xs text-gray-500">
                  Use this area for voice-to-text transcriptions, detailed observations, or any unstructured meeting content.
                </div>
              </div>
            )}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">Meeting Summary</h4>
                    <div className="text-sm text-gray-500">
                      Characters: {meetingSummary.length}
                    </div>
                  </div>
                  <DebouncedInput
                    type="textarea"
                    rows={8}
                    value={meetingSummary}
                    onChange={handleMeetingSummaryChange}
                    disabled={!canEdit}
                    placeholder={canEdit ? "Summarize the key outcomes, decisions, and next steps from this meeting..." : "No summary recorded"}
                    debounceMs={1000}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Provide a concise summary of what was accomplished, key decisions made, and next steps identified.
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">Overall Assessment</h4>
                    <div className="text-sm text-gray-500">
                      Characters: {overallAssessment.length}
                    </div>
                  </div>
                  <DebouncedInput
                    type="textarea"
                    rows={8}
                    value={overallAssessment}
                    onChange={handleOverallAssessmentChange}
                    disabled={!canEdit}
                    placeholder={canEdit ? "Assess the meeting effectiveness, engagement level, and overall success..." : "No assessment recorded"}
                    debounceMs={1000}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Evaluate how well the meeting achieved its objectives and the overall quality of the session.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Default Tab Layout */
        <>
          {/* Notes Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3 text-sm font-medium rounded-t-lg ${
                    activeTab === tab.id
                      ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  title={tab.description}
                >
                  <div className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    {tab.label}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {activeTab === 'agenda' && renderAgendaContent()}
            {activeTab === 'insights' && renderInsightsContent()}
            {activeTab === 'transcription' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Meeting Transcription</h4>
                  <div className="text-sm text-gray-500">
                    Characters: {unstructuredNotes.length}
                  </div>
                </div>
                <DebouncedInput
                  type="textarea"
                  rows={12}
                  value={unstructuredNotes}
                  onChange={handleUnstructuredNotesChange}
                  disabled={!canEdit}
                  placeholder={canEdit ? "Capture meeting transcription, observations, or detailed notes here..." : "No transcription recorded"}
                  debounceMs={1000}
                />
                <div className="text-xs text-gray-500">
                  Use this area for voice-to-text transcriptions, detailed observations, or any unstructured meeting content.
                </div>
              </div>
            )}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">Meeting Summary</h4>
                    <div className="text-sm text-gray-500">
                      Characters: {meetingSummary.length}
                    </div>
                  </div>
                  <DebouncedInput
                    type="textarea"
                    rows={6}
                    value={meetingSummary}
                    onChange={handleMeetingSummaryChange}
                    disabled={!canEdit}
                    placeholder={canEdit ? "Summarize the key outcomes, decisions, and next steps from this meeting..." : "No summary recorded"}
                    debounceMs={1000}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Provide a concise summary of what was accomplished, key decisions made, and next steps identified.
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">Overall Assessment</h4>
                    <div className="text-sm text-gray-500">
                      Characters: {overallAssessment.length}
                    </div>
                  </div>
                  <DebouncedInput
                    type="textarea"
                    rows={6}
                    value={overallAssessment}
                    onChange={handleOverallAssessmentChange}
                    disabled={!canEdit}
                    placeholder={canEdit ? "Assess the meeting effectiveness, engagement level, and overall success..." : "No assessment recorded"}
                    debounceMs={1000}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Evaluate how well the meeting achieved its objectives and the overall quality of the session.
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(NotesManager);