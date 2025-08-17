import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Clock, FileText, ChevronDown, Calendar, Target, MessageSquare, Search } from 'lucide-react';

interface MeetingType {
  meeting_type_id: number;
  type_name: string;
  default_duration_minutes: number;
  description: string;
  template_structure: any;
  usage_count: number; // Added usage_count to the interface
}

interface MeetingTypeSelectorProps {
  selectedTypeId: number | null;
  onTypeSelect: (typeId: number, duration: number, template: any) => void;
}

const MeetingTypeSelector: React.FC<MeetingTypeSelectorProps> = ({
  selectedTypeId,
  onTypeSelect
}) => {
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  useEffect(() => {
    fetchMeetingTypes();
  }, []);

  const fetchMeetingTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_types')
        .select('meeting_type_id, type_name, default_duration_minutes, description, template_structure, usage_count')
        .order('type_name');

      if (error) throw error;
      setMeetingTypes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting types');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = meetingTypes.find(type => type.meeting_type_id === selectedTypeId);

  const handleTypeSelect = (type: MeetingType) => {
    onTypeSelect(type.meeting_type_id, type.default_duration_minutes, type.template_structure);
    setIsOpen(false);
    setSearchTerm(''); // Clear search when selection is made
    setShowTemplatePreview(false); // Always start collapsed
  };

  // Filter meeting types based on search term
  const filteredMeetingTypes = meetingTypes.filter(type =>
    type.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTemplatePreview = (template: any) => {
    if (!template) return null;

    return (
      <div className="space-y-4">
        {/* Key Messages */}
        {template.key_messages && Array.isArray(template.key_messages) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Key Messages</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {template.key_messages.map((message: string, index: number) => (
                <li key={index} className="text-xs text-gray-600">{message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Agenda Sections */}
        {template.agenda_sections && Array.isArray(template.agenda_sections) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Agenda Structure</span>
            </div>
            <div className="space-y-3">
              {template.agenda_sections.map((section: any, index: number) => (
                <div key={index} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-800">
                      {index + 1}. {section.section}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {section.time_minutes || 0} min
                    </span>
                  </div>
                  {section.purpose && (
                    <p className="text-xs text-gray-600 mb-1">{section.purpose}</p>
                  )}
                  {section.questions && Array.isArray(section.questions) && (
                    <ul className="list-disc list-inside space-y-1">
                      {section.questions.slice(0, 2).map((question: string, qIndex: number) => (
                        <li key={qIndex} className="text-xs text-gray-500">{question}</li>
                      ))}
                      {section.questions.length > 2 && (
                        <li className="text-xs text-gray-400 italic">
                          +{section.questions.length - 2} more questions...
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expected Outputs */}
        {template.expected_outputs && Array.isArray(template.expected_outputs) && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Expected Outcomes</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              {template.expected_outputs.map((output: string, index: number) => (
                <li key={index} className="text-xs text-gray-600">{output}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Meeting Objectives */}
        {template.meeting_objectives && Array.isArray(template.meeting_objectives) && (
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">Meeting Objectives</span>
            <div className="space-y-1">
              {template.meeting_objectives.map((objective: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-600">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
        Error loading meeting types: {error}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Meeting Type Dropdown */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Meeting Type *
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <span className={selectedType ? 'text-gray-900' : 'text-gray-500'}>
              {selectedType ? selectedType.type_name : 'Select a meeting type...'}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search meeting types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Meeting Types List */}
              <div className="max-h-60 overflow-auto">
                {filteredMeetingTypes.length === 0 ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    No meeting types found matching "{searchTerm}"
                  </div>
                ) : (
                  filteredMeetingTypes.map((type) => (
                    <button
                      key={type.meeting_type_id}
                      type="button"
                      onClick={() => handleTypeSelect(type)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900">{type.type_name}</div>
                        {type.usage_count > 0 && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                            Used {type.usage_count} time{type.usage_count === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {type.default_duration_minutes} minutes
                      </div>
                      {type.description && (
                        <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Template Preview */}
      {selectedType && selectedType.template_structure && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Template Preview</h3>
            <button
              type="button"
              onClick={() => setShowTemplatePreview(!showTemplatePreview)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showTemplatePreview ? 'Hide' : 'Show'} Template
            </button>
          </div>
          
          {showTemplatePreview ? (
            <div className="text-xs text-gray-600">
              {formatTemplatePreview(selectedType.template_structure)}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic">
              Click "Show Template" to view the meeting structure and agenda
            </div>
          )}
        </div>
      )}

      {/* No Template Message */}
      {selectedType && !selectedType.template_structure && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">No Template Structure</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            This meeting type doesn't have a predefined template structure. You can create a custom meeting without following a specific format.
          </p>
        </div>
      )}
    </div>
  );
};

export default MeetingTypeSelector;
