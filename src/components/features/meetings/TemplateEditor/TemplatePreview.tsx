import React from 'react';
import { Clock, Users, Target, Lightbulb, Eye, Zap, FileText, MessageSquare, CheckSquare } from 'lucide-react';

type SectionType = 'discussion' | 'presentation' | 'brainstorm' | 'review' | 'decision' | 'action_planning';

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

interface TemplateData {
  key_messages?: string[];
  agenda_sections?: AgendaSection[];
  setup?: any;
  expected_outputs?: string[];
  learning_objectives?: string[];
}

interface TemplatePreviewProps {
  templateData: TemplateData;
  className?: string;
}

const getSectionTypeInfo = (type: SectionType) => {
  switch (type) {
    case 'discussion':
      return {
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        label: 'Discussion'
      };
    case 'presentation':
      return {
        icon: FileText,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300',
        label: 'Presentation'
      };
    case 'brainstorm':
      return {
        icon: Lightbulb,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        label: 'Brainstorm'
      };
    case 'review':
      return {
        icon: Eye,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        label: 'Review'
      };
    case 'decision':
      return {
        icon: Target,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        label: 'Decision'
      };
    case 'action_planning':
      return {
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        label: 'Action Planning'
      };
  }
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateData,
  className = ''
}) => {
  const getTotalTime = () => {
    return templateData.agenda_sections?.reduce((total, section) => total + section.time_minutes, 0) || 0;
  };

  const formatTotalTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={`bg-white border rounded-lg p-6 ${className}`}>
      {/* Preview Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Meeting Template Preview</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTotalTime(getTotalTime())}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{templateData.agenda_sections?.length || 0} sections</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          This preview shows how the template will appear to meeting participants and facilitators.
        </p>
      </div>

      {/* Key Messages */}
      {templateData.key_messages && templateData.key_messages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Key Messages</h4>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2">
              {templateData.key_messages.map((message, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{message || 'Empty message'}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Agenda Sections */}
      {templateData.agenda_sections && templateData.agenda_sections.length > 0 ? (
        <div className="space-y-6">
          <h4 className="font-medium text-gray-900">Meeting Agenda</h4>
          
          {/* Timeline */}
          <div className="space-y-4">
            {templateData.agenda_sections.map((section, index) => {
              const typeInfo = section.section_type ? getSectionTypeInfo(section.section_type) : null;
              const TypeIcon = typeInfo?.icon || FileText;
              
              return (
                <div key={index} className="relative">
                  {/* Timeline connector */}
                  {index > 0 && (
                    <div className="absolute left-6 -top-4 w-0.5 h-4 bg-gray-300"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Timeline dot with icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${typeInfo?.bgColor || 'bg-gray-100'}`}>
                      <TypeIcon className={`h-5 w-5 ${typeInfo?.color || 'text-gray-600'}`} />
                    </div>
                    
                    {/* Section content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-semibold text-gray-900">{section.section}</h5>
                        {typeInfo && (
                          <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.bgColor} ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{section.time_minutes}m</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{section.purpose}</p>
                      
                      {/* Section content preview */}
                      <div className="space-y-3">
                        {/* Questions */}
                        {section.questions && section.questions.length > 0 && (
                          <div>
                            <h6 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                              Discussion Questions
                            </h6>
                            <ul className="space-y-1">
                              {section.questions.filter(q => q.trim()).map((question, qIndex) => (
                                <li key={qIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-gray-400 mt-1">{qIndex + 1}.</span>
                                  <span>{question}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Talking Points */}
                        {section.talking_points && section.talking_points.length > 0 && (
                          <div>
                            <h6 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                              Key Points to Cover
                            </h6>
                            <ul className="space-y-1">
                              {section.talking_points.filter(point => point.trim()).map((point, pIndex) => (
                                <li key={pIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-gray-400 mt-1">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Checklist */}
                        {section.checklist && section.checklist.length > 0 && (
                          <div>
                            <h6 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                              Checklist Items
                            </h6>
                            <ul className="space-y-1">
                              {section.checklist.filter(item => item.trim()).map((item, cIndex) => (
                                <li key={cIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                  <CheckSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Notes */}
                        {section.notes && section.notes.trim() && (
                          <div>
                            <h6 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                              Notes
                            </h6>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-wrap">
                              {section.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meeting Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Meeting Summary</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Total Duration:</span>
                <span className="ml-2 text-gray-600">{formatTotalTime(getTotalTime())}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sections:</span>
                <span className="ml-2 text-gray-600">{templateData.agenda_sections.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Key Messages:</span>
                <span className="ml-2 text-gray-600">{templateData.key_messages?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Template Content</h4>
          <p className="text-sm">Add agenda sections to see the meeting preview</p>
        </div>
      )}
    </div>
  );
};

export default TemplatePreview;