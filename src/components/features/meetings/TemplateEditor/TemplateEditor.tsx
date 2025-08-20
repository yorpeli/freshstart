import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Clock, FileText, MessageSquare, CheckSquare, Users, Target, Lightbulb, Eye, CheckCircle, Zap, AlertTriangle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { validateTemplate } from './templateValidation';
import type { ValidationError } from './templateValidation';
import ValidationPanel from './ValidationPanel';

type SectionType = 'discussion' | 'presentation' | 'brainstorm' | 'review' | 'decision' | 'action_planning';

const getSectionTypeInfo = (type: SectionType) => {
  switch (type) {
    case 'discussion':
      return {
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        label: 'Discussion',
        description: 'Open discussion and dialogue'
      };
    case 'presentation':
      return {
        icon: FileText,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        label: 'Presentation',
        description: 'Present information or updates'
      };
    case 'brainstorm':
      return {
        icon: Lightbulb,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        label: 'Brainstorm',
        description: 'Generate ideas and solutions'
      };
    case 'review':
      return {
        icon: Eye,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        label: 'Review',
        description: 'Review and evaluate work'
      };
    case 'decision':
      return {
        icon: Target,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        label: 'Decision',
        description: 'Make decisions and commitments'
      };
    case 'action_planning':
      return {
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        label: 'Action Planning',
        description: 'Plan next steps and actions'
      };
  }
};

interface AgendaSection {
  id?: string;
  section: string;
  purpose: string;
  time_minutes: number;
  section_type?: SectionType;
  questions?: string[];
  talking_points?: string[];
  checklist?: string[];
  notes?: string;
  components?: any;
}

interface SortableAgendaSectionProps {
  section: AgendaSection;
  index: number;
  isReadOnly: boolean;
  onSectionUpdate: (index: number, updates: Partial<AgendaSection>) => void;
  onRemoveSection: (index: number) => void;
}

const SortableAgendaSection: React.FC<SortableAgendaSectionProps> = React.memo(({
  section,
  index,
  isReadOnly,
  onSectionUpdate,
  onRemoveSection
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id || `section-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg p-4 bg-white"
      data-section-index={index}
    >
      {/* Section Header */}
      <div className="flex items-start gap-3 mb-4">
        {!isReadOnly && (
          <div
            className="cursor-move text-gray-400 mt-1 hover:text-gray-600 transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        
        <div className="flex-1 space-y-3">
          {/* Section Title */}
          <div className="flex items-center gap-2">
            {isReadOnly ? (
              <h5 className="font-medium text-gray-900">{section.section}</h5>
            ) : (
              <input
                type="text"
                value={section.section}
                onChange={(e) => onSectionUpdate(index, { section: e.target.value })}
                className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            )}
            
            {/* Section Type Badge */}
            {section.section_type && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs">
                {(() => {
                  const typeInfo = getSectionTypeInfo(section.section_type);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <>
                      <TypeIcon className={`h-3 w-3 ${typeInfo.color}`} />
                      <span className={typeInfo.color}>{typeInfo.label}</span>
                    </>
                  );
                })()}
              </div>
            )}
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              {isReadOnly ? (
                <span>{section.time_minutes}m</span>
              ) : (
                <input
                  type="number"
                  value={section.time_minutes}
                  onChange={(e) => onSectionUpdate(index, { time_minutes: parseInt(e.target.value) || 0 })}
                  className="w-12 text-center border rounded px-1"
                  min="1"
                  max="180"
                />
              )}
            </div>
          </div>

          {/* Section Type Selector */}
          {!isReadOnly && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Section Type</label>
              <select
                value={section.section_type || 'discussion'}
                onChange={(e) => onSectionUpdate(index, { section_type: e.target.value as SectionType })}
                className="w-full mt-1 p-2 text-sm border rounded-md"
              >
                <option value="discussion">Discussion</option>
                <option value="presentation">Presentation</option>
                <option value="brainstorm">Brainstorm</option>
                <option value="review">Review</option>
                <option value="decision">Decision</option>
                <option value="action_planning">Action Planning</option>
              </select>
            </div>
          )}

          {/* Purpose */}
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Purpose</label>
            {isReadOnly ? (
              <p className="text-sm text-gray-700 mt-1">{section.purpose}</p>
            ) : (
              <textarea
                value={section.purpose}
                onChange={(e) => onSectionUpdate(index, { purpose: e.target.value })}
                className="w-full mt-1 p-2 text-sm border rounded-md resize-none"
                rows={2}
                placeholder="Describe the purpose of this section..."
              />
            )}
          </div>

          {/* Questions */}
          {section.questions && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Questions</label>
              <div className="mt-2 space-y-2">
                {section.questions.map((question, qIndex) => (
                  <div key={qIndex} className="flex items-start gap-2">
                    <span className="text-sm text-gray-400 mt-1">{qIndex + 1}.</span>
                    {isReadOnly ? (
                      <p className="text-sm text-gray-700 flex-1">{question}</p>
                    ) : (
                      <div className="flex-1 flex gap-2">
                        <textarea
                          value={question}
                          onChange={(e) => {
                            const newQuestions = [...section.questions!];
                            newQuestions[qIndex] = e.target.value;
                            onSectionUpdate(index, { questions: newQuestions });
                          }}
                          className="flex-1 p-2 text-sm border rounded-md resize-none"
                          rows={1}
                          placeholder="Enter question..."
                        />
                        <button
                          onClick={() => {
                            const newQuestions = section.questions!.filter((_, i) => i !== qIndex);
                            onSectionUpdate(index, { questions: newQuestions });
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      const newQuestions = [...(section.questions || []), ''];
                      onSectionUpdate(index, { questions: newQuestions });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    + Add Question
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Talking Points */}
          {section.talking_points && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Talking Points</label>
              <div className="mt-2 space-y-2">
                {section.talking_points.map((point, pIndex) => (
                  <div key={pIndex} className="flex items-start gap-2">
                    <span className="text-sm text-gray-400 mt-1">•</span>
                    {isReadOnly ? (
                      <p className="text-sm text-gray-700 flex-1">{point}</p>
                    ) : (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...section.talking_points!];
                            newPoints[pIndex] = e.target.value;
                            onSectionUpdate(index, { talking_points: newPoints });
                          }}
                          className="flex-1 p-2 text-sm border rounded-md"
                          placeholder="Enter talking point..."
                        />
                        <button
                          onClick={() => {
                            const newPoints = section.talking_points!.filter((_, i) => i !== pIndex);
                            onSectionUpdate(index, { talking_points: newPoints });
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checklist Items */}
          {section.checklist && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Checklist</label>
              <div className="mt-2 space-y-2">
                {section.checklist.map((item, cIndex) => (
                  <div key={cIndex} className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    {isReadOnly ? (
                      <p className="text-sm text-gray-700 flex-1">{item}</p>
                    ) : (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newChecklist = [...section.checklist!];
                            newChecklist[cIndex] = e.target.value;
                            onSectionUpdate(index, { checklist: newChecklist });
                          }}
                          className="flex-1 p-2 text-sm border rounded-md"
                          placeholder="Enter checklist item..."
                        />
                        <button
                          onClick={() => {
                            const newChecklist = section.checklist!.filter((_, i) => i !== cIndex);
                            onSectionUpdate(index, { checklist: newChecklist });
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {!isReadOnly && (
                  <button
                    onClick={() => {
                      const newChecklist = [...(section.checklist || []), ''];
                      onSectionUpdate(index, { checklist: newChecklist });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    + Add Checklist Item
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {section.notes !== undefined && (
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">Notes</label>
              {isReadOnly ? (
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{section.notes}</p>
              ) : (
                <textarea
                  value={section.notes}
                  onChange={(e) => onSectionUpdate(index, { notes: e.target.value })}
                  className="w-full mt-1 p-2 text-sm border rounded-md resize-none"
                  rows={3}
                  placeholder="Add notes for this section..."
                />
              )}
            </div>
          )}

          {/* Add Content Buttons */}
          {!isReadOnly && (
            <div className="flex flex-wrap gap-2 pt-2">
              {!section.questions?.length && (
                <button
                  onClick={() => onSectionUpdate(index, { questions: [''] })}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  + Questions
                </button>
              )}
              {!section.talking_points?.length && (
                <button
                  onClick={() => onSectionUpdate(index, { talking_points: [''] })}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  + Talking Points
                </button>
              )}
              {!section.checklist?.length && (
                <button
                  onClick={() => onSectionUpdate(index, { checklist: [''] })}
                  className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  + Checklist
                </button>
              )}
              {section.notes === undefined && (
                <button
                  onClick={() => onSectionUpdate(index, { notes: '' })}
                  className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                >
                  + Notes
                </button>
              )}
            </div>
          )}
        </div>

        {!isReadOnly && (
          <button
            onClick={() => onRemoveSection(index)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
});

interface TemplateData {
  key_messages?: string[];
  agenda_sections?: AgendaSection[];
  setup?: any;
  expected_outputs?: string[];
  learning_objectives?: string[];
}

interface TemplateEditorProps {
  templateData: TemplateData;
  onTemplateChange: (newTemplate: TemplateData) => void;
  isReadOnly?: boolean;
  className?: string;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateData,
  onTemplateChange,
  isReadOnly = false,
  className = ''
}) => {
  const [showValidation, setShowValidation] = useState(false);
  const [debouncedTemplateData, setDebouncedTemplateData] = useState(templateData);
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debounce template data for validation (500ms delay)
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      setDebouncedTemplateData(templateData);
    }, 500);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [templateData]);

  // Validate template data (only runs when debounced data changes)
  const validation = useMemo(() => validateTemplate(debouncedTemplateData), [debouncedTemplateData]);

  // Ensure agenda sections have IDs for drag and drop
  const agendaSections = (templateData.agenda_sections || []).map((section, index) => ({
    ...section,
    id: section.id || `section-${index}`
  }));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const currentSections = (templateData.agenda_sections || []).map((section, index) => ({
        ...section,
        id: section.id || `section-${index}`
      }));
      
      const oldIndex = currentSections.findIndex((section) => section.id === active.id);
      const newIndex = currentSections.findIndex((section) => section.id === over?.id);

      const newSections = arrayMove(currentSections, oldIndex, newIndex);
      onTemplateChange({
        ...templateData,
        agenda_sections: newSections
      });
    }
  }, [templateData, onTemplateChange]);

  const handleSectionUpdate = useCallback((index: number, updates: Partial<AgendaSection>) => {
    if (isReadOnly) return;
    
    const currentSections = templateData.agenda_sections || [];
    const newSections = [...currentSections];
    newSections[index] = { ...newSections[index], ...updates };
    
    onTemplateChange({
      ...templateData,
      agenda_sections: newSections
    });
  }, [templateData, onTemplateChange, isReadOnly]);

  const handleAddSection = useCallback(() => {
    if (isReadOnly) return;
    
    const newSection: AgendaSection = {
      id: `section-${Date.now()}`,
      section: 'New Section',
      purpose: 'Define the purpose of this section',
      time_minutes: 15,
      section_type: 'discussion',
      questions: []
    };
    
    const currentSections = templateData.agenda_sections || [];
    const newSections = [...currentSections, newSection];
    onTemplateChange({
      ...templateData,
      agenda_sections: newSections
    });
  }, [templateData, onTemplateChange, isReadOnly]);

  const handleRemoveSection = useCallback((index: number) => {
    if (isReadOnly) return;
    
    const currentSections = templateData.agenda_sections || [];
    const newSections = currentSections.filter((_, i) => i !== index);
    onTemplateChange({
      ...templateData,
      agenda_sections: newSections
    });
  }, [templateData, onTemplateChange, isReadOnly]);

  const handleKeyMessagesUpdate = useCallback((newMessages: string[]) => {
    if (isReadOnly) return;
    
    onTemplateChange({
      ...templateData,
      key_messages: newMessages
    });
  }, [templateData, onTemplateChange, isReadOnly]);

  const addKeyMessage = () => {
    if (isReadOnly) return;
    
    const newMessages = [...(templateData.key_messages || []), ''];
    handleKeyMessagesUpdate(newMessages);
  };

  const updateKeyMessage = (index: number, value: string) => {
    if (isReadOnly) return;
    
    const newMessages = [...(templateData.key_messages || [])];
    newMessages[index] = value;
    handleKeyMessagesUpdate(newMessages);
  };

  const removeKeyMessage = (index: number) => {
    if (isReadOnly) return;
    
    const newMessages = templateData.key_messages?.filter((_, i) => i !== index) || [];
    handleKeyMessagesUpdate(newMessages);
  };

  const getTotalTime = () => {
    return agendaSections.reduce((total, section) => total + section.time_minutes, 0);
  };

  const handleValidationErrorClick = (error: ValidationError) => {
    if (error.sectionIndex !== undefined) {
      // Scroll to the specific section if possible
      const sectionElement = document.querySelector(`[data-section-index="${error.sectionIndex}"]`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Template Editor</h3>
          <p className="text-sm text-gray-600">
            Customize the meeting template structure and content
          </p>
        </div>
        
        {/* Template Stats and Validation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{getTotalTime()} minutes total</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{agendaSections.length} sections</span>
            </div>
          </div>

          {/* Validation Status */}
          <div className="flex items-center gap-2">
            {validation.errors.length > 0 ? (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{validation.errors.length} errors</span>
              </div>
            ) : validation.warnings.length > 0 ? (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{validation.warnings.length} warnings</span>
              </div>
            ) : debouncedTemplateData === templateData ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Validating...</span>
              </div>
            )}

            <button
              onClick={() => setShowValidation(!showValidation)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {showValidation ? 'Hide' : 'Show'} Validation
            </button>
          </div>
        </div>
      </div>

      {/* Validation Panel */}
      {showValidation && (
        <ValidationPanel
          validation={validation}
          onErrorClick={handleValidationErrorClick}
        />
      )}

      {/* Key Messages Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-900">Key Messages</h4>
          {!isReadOnly && (
            <button
              onClick={addKeyMessage}
              className="ml-auto text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {templateData.key_messages?.map((message, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                {isReadOnly ? (
                  <p className="text-sm text-gray-700 p-2 bg-white rounded border">
                    {message}
                  </p>
                ) : (
                  <textarea
                    value={message}
                    onChange={(e) => updateKeyMessage(index, e.target.value)}
                    className="w-full p-2 text-sm border rounded-md resize-none"
                    rows={2}
                    placeholder="Enter key message..."
                  />
                )}
              </div>
              {!isReadOnly && (
                <button
                  onClick={() => removeKeyMessage(index)}
                  className="text-red-500 hover:text-red-700 transition-colors mt-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )) || (
            <p className="text-sm text-gray-500 italic">No key messages defined</p>
          )}
        </div>
      </div>

      {/* Agenda Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Agenda Sections</h4>
          {!isReadOnly && (
            <button
              onClick={handleAddSection}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={agendaSections.map(section => section.id!)}
            strategy={verticalListSortingStrategy}
          >
            {agendaSections.map((section, index) => (
              <SortableAgendaSection
                key={section.id}
                section={section}
                index={index}
                isReadOnly={isReadOnly}
                onSectionUpdate={handleSectionUpdate}
                onRemoveSection={handleRemoveSection}
              />
            ))}
          </SortableContext>
        </DndContext>

        {agendaSections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No agenda sections defined</p>
            {!isReadOnly && (
              <button
                onClick={handleAddSection}
                className="mt-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Add your first section
              </button>
            )}
          </div>
        )}
      </div>

      {/* Template Actions */}
      {!isReadOnly && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              Reset to Default
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Save Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;