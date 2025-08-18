import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableNumberProps {
  value: number;
  onSave: (value: number) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

const EditableNumber: React.FC<EditableNumberProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = 'Enter number...',
  className = '',
  label,
  min,
  max,
  step = 1,
  required = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditValue(value.toString());
    setError('');
  };

  const validateValue = (inputValue: string): string => {
    const numValue = Number(inputValue);
    
    if (required && inputValue.trim() === '') {
      return 'This field is required';
    }
    
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    
    if (min !== undefined && numValue < min) {
      return `Value must be at least ${min}`;
    }
    
    if (max !== undefined && numValue > max) {
      return `Value must be at most ${max}`;
    }
    
    return '';
  };

  const handleSave = () => {
    const validationError = validateValue(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    const numValue = Number(editValue);
    if (numValue !== value) {
      onSave(numValue);
    }
    setIsEditing(false);
    setError('');
  };

  const handleCancel = () => {
    setEditValue(value.toString());
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

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className={`
            flex-1 px-2 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />
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
        <span className="text-gray-900">{value}</span>
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

export default EditableNumber;
