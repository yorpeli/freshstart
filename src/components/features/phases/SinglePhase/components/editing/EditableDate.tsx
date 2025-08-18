import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Calendar } from 'lucide-react';

interface EditableDateProps {
  value: string;
  onSave: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  label?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

const EditableDate: React.FC<EditableDateProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = 'Select date...',
  className = '',
  label,
  min,
  max,
  required = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditValue(value);
    setError('');
  };

  const validateDate = (dateValue: string): string => {
    if (required && !dateValue) {
      return 'This field is required';
    }
    
          if (dateValue) {
        const selectedDate = new Date(dateValue);
        
        if (isNaN(selectedDate.getTime())) {
          return 'Please enter a valid date';
        }
        
        if (min && selectedDate < new Date(min)) {
          return `Date must be after ${new Date(min).toLocaleDateString()}`;
        }
        
        if (max && selectedDate > new Date(max)) {
          return `Date must be before ${new Date(max).toLocaleDateString()}`;
        }
      }
    
    return '';
  };

  const handleSave = () => {
    const validationError = validateDate(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
    setError('');
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError('');
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return placeholder;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="date"
            value={editValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder={placeholder}
            min={min}
            max={max}
            className={`
              w-full px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <Calendar 
            size={16} 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
          />
        </div>
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
          title="Save"
        >
          <Check size={16} />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded"
          title="Cancel"
        >
          <X size={16} />
        </button>
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div 
      onClick={handleStartEditing}
      className={`
        group cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition-colors
        ${className}
      `}
      title="Click to edit"
    >
      <div className="flex items-center space-x-2">
        <span className="text-gray-900">{formatDateForDisplay(value)}</span>
        <Edit2 
          size={14} 
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
        />
      </div>
      {label && (
        <div className="text-xs text-gray-500 mt-1">{label}</div>
      )}
    </div>
  );
};

export default EditableDate;
