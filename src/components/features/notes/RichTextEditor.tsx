import React, { useState, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Start writing your note...',
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-t-md">
        <button
          type="button"
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="List"
        >
          •
        </button>
        <button
          type="button"
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
          title="Link"
        >
          🔗
        </button>
        <div className="text-xs text-gray-500 ml-2">
          Use @ for people, # for tasks, ! for meetings
        </div>
      </div>
      
      <textarea
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-32 p-3 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        style={{ fontFamily: 'monospace' }}
      />
      
      <div className="text-xs text-gray-500">
        {internalValue.length} characters
      </div>
    </div>
  );
};

export default RichTextEditor;
