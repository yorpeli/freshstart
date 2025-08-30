import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '../../../shared';

interface MeetingFieldProps {
  fieldKey: string;
  label: string;
  icon: string;
  value: string;
  placeholder: string;
  backgroundColor: string;
  borderColor: string;
  minHeight?: string;
  canEdit: boolean;
  onSave: (field: string, value: string) => Promise<void>;
  onCancel: (field: string) => void;
}

const MeetingField: React.FC<MeetingFieldProps> = ({
  fieldKey,
  label,
  icon,
  value,
  placeholder,
  backgroundColor,
  borderColor,
  minHeight = "6rem",
  canEdit,
  onSave,
  onCancel
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Sync local state with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onSave(fieldKey, localValue);
      setIsEditing(false);
    } catch (error) {
      console.error(`Failed to save ${fieldKey}:`, error);
    }
  };

  const handleCancel = () => {
    setLocalValue(value); // Reset to original value
    onCancel(fieldKey);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-lg font-medium text-gray-900">{label}</h3>
        </div>
        
        {/* Edit/Save/Cancel Buttons */}
        {canEdit && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      {!isEditing ? (
        /* View Mode - Clean Display */
        <div className="prose prose-sm max-w-none">
          {localValue ? (
            <div 
              className={`${backgroundColor} border ${borderColor} rounded-lg p-4`}
              style={{ minHeight }}
            >
              <div className="text-sm text-gray-900 whitespace-pre-wrap">{localValue}</div>
            </div>
          ) : (
            <div className="text-gray-500 italic text-sm" style={{ minHeight }}>
              No {label.toLowerCase()} yet. Click Edit to add {label.toLowerCase()}.
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode - RichTextEditor */
        <RichTextEditor
          value={localValue}
          onChange={setLocalValue}
          placeholder={placeholder}
          label={label}
          autoSave={false}
          showMentions={true}
          showCharacterCount={true}
          minHeight={minHeight}
          maxHeight="none"
          disabled={false}
        />
      )}
    </div>
  );
};

export default MeetingField;
