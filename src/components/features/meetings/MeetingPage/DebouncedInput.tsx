import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'textarea';
  rows?: number;
  disabled?: boolean;
  debounceMs?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = React.memo(({
  value,
  onChange,
  onBlur,
  placeholder,
  className = '',
  type = 'text',
  rows = 1,
  disabled = false,
  debounceMs = 300
}) => {
  // Local state for instant UI feedback
  const [localValue, setLocalValue] = useState(value);
  
  // Refs for stable callback references
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
  }, [onChange, onBlur]);

  // Smart sync with props to prevent infinite loops
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current && value !== localValue) {
      setLocalValue(value);
    }
    prevValueRef.current = value;
  }, [value, localValue]);

  // Debounced change handler with stable reference
  const debouncedOnChange = useCallback((newValue: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onChangeRef.current(newValue);
    }, debounceMs);
  }, [debounceMs]);

  // Local change handler for instant feedback
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue); // Instant local update
    debouncedOnChange(newValue); // Debounced parent update
  }, [debouncedOnChange]);

  // Blur handler for immediate save
  const handleBlur = useCallback(() => {
    // Clear any pending debounced updates
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Immediate save on blur
    if (onBlurRef.current) {
      onBlurRef.current(localValue);
    } else {
      onChangeRef.current(localValue);
    }
  }, [localValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const baseClassName = `px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`;

  if (type === 'textarea') {
    return (
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full resize-y ${baseClassName}`}
      />
    );
  }

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full ${baseClassName}`}
    />
  );
});

DebouncedInput.displayName = 'DebouncedInput';

export default DebouncedInput;