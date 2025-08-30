import React from 'react';
import MeetingField from './MeetingField';
import { MEETING_FIELDS_CONFIG, FIELD_LAYOUT } from './meetingFieldsConfig.js';
import type { MeetingFieldConfig } from './meetingFieldsConfig.js';

interface MeetingContentProps {
  meetingData: {
    meeting_objectives: string | null;
    key_messages: string | null;
    unstructured_notes: string | null;
    meeting_summary: string | null;
    overall_assessment: string | null;
  };
  canEdit: boolean;
  onSave: (field: string, value: string) => Promise<void>;
  onCancel: (field: string) => void;
}

const MeetingContent: React.FC<MeetingContentProps> = ({
  meetingData,
  canEdit,
  onSave,
  onCancel
}) => {
  // Helper function to get field config by key
  const getFieldConfig = (key: string): MeetingFieldConfig | undefined => {
    return MEETING_FIELDS_CONFIG.find(field => field.key === key);
  };

  // Helper function to get field value by key
  const getFieldValue = (key: string): string => {
    const config = getFieldConfig(key);
    if (!config) return '';
    return meetingData[config.databaseField] || '';
  };

  // Render a row of fields
  const renderFieldRow = (fieldKeys: string[]) => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fieldKeys.map(key => {
          const config = getFieldConfig(key);
          if (!config) return null;

          return (
            <MeetingField
              key={key}
              fieldKey={key}
              label={config.label}
              icon={config.icon}
              value={getFieldValue(key)}
              placeholder={config.placeholder}
              backgroundColor={config.backgroundColor}
              borderColor={config.borderColor}
              minHeight={config.minHeight}
              canEdit={canEdit}
              onSave={onSave}
              onCancel={onCancel}
            />
          );
        })}
      </div>
    );
  };

  // Render a single field (for bottom row)
  const renderSingleField = (fieldKey: string) => {
    const config = getFieldConfig(fieldKey);
    if (!config) return null;

    return (
      <MeetingField
        key={fieldKey}
        fieldKey={fieldKey}
        label={config.label}
        icon={config.icon}
        value={getFieldValue(fieldKey)}
        placeholder={config.placeholder}
        backgroundColor={config.backgroundColor}
        borderColor={config.borderColor}
        minHeight={config.minHeight}
        canEdit={canEdit}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Objectives and Key Messages side by side */}
      {renderFieldRow(FIELD_LAYOUT.topRow)}

      {/* Middle Row: Pre-Meeting Notes and Meeting Summary side by side */}
      {renderFieldRow(FIELD_LAYOUT.middleRow)}

      {/* Bottom Row: Overall Assessment (full width) */}
      {FIELD_LAYOUT.bottomRow.map(key => renderSingleField(key))}
    </div>
  );
};

export default MeetingContent;
