import React, { useState } from 'react';
import { Edit2, Eye, FileText } from 'lucide-react';
import TemplateEditor from './TemplateEditor';
import TemplatePreview from './TemplatePreview';

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

interface TemplateEditorWithPreviewProps {
  templateData: TemplateData;
  onTemplateChange: (newTemplate: TemplateData) => void;
  isReadOnly?: boolean;
  className?: string;
}

const TemplateEditorWithPreview: React.FC<TemplateEditorWithPreviewProps> = ({
  templateData,
  onTemplateChange,
  isReadOnly = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'edit'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Edit2 className="h-4 w-4" />
          Template Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'edit' ? (
          <TemplateEditor
            templateData={templateData}
            onTemplateChange={onTemplateChange}
            isReadOnly={isReadOnly}
          />
        ) : (
          <TemplatePreview
            templateData={templateData}
          />
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{templateData.agenda_sections?.length || 0} sections</span>
          </div>
          <div>
            <span>{templateData.key_messages?.length || 0} key messages</span>
          </div>
        </div>
        
        <div>
          Total: {templateData.agenda_sections?.reduce((total, section) => total + section.time_minutes, 0) || 0} minutes
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorWithPreview;