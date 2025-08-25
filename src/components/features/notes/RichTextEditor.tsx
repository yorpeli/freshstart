import React, { useState, useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Mention {
  type: 'people' | 'tasks' | 'meetings';
  text: string;
  start: number;
  end: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Start writing your note...',
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Parse mentions from text
  const parseMentions = (text: string): Mention[] => {
    const mentionRegex = /(@\w+)|(#\w+)|(!\w+)/g;
    const mentions: Mention[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const type = match[0].startsWith('@') ? 'people' : 
                   match[0].startsWith('#') ? 'tasks' : 'meetings';
      
      mentions.push({
        type,
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    return mentions;
  };

  // Update mentions when text changes
  useEffect(() => {
    const newMentions = parseMentions(internalValue);
    setMentions(newMentions);
  }, [internalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };

  // Get current selection
  const getSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return { start: 0, end: 0, text: '' };
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.substring(start, end);
    
    return { start, end, text };
  };

  // Apply formatting to selected text
  const applyFormatting = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, text } = getSelection();
    const newText = internalValue.substring(0, start) + before + text + after + internalValue.substring(end);
    
    setInternalValue(newText);
    onChange(newText);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + text.length);
    }, 0);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormatting('**', '**');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('*', '*');
          break;
        case 'l':
          e.preventDefault();
          applyFormatting('[', '](url)');
          break;
      }
    }
  };

  // Formatting functions
  const makeBold = () => applyFormatting('**', '**');
  const makeItalic = () => applyFormatting('*', '*');
  const makeLink = () => applyFormatting('[', '](url)');
  
  const makeList = () => {
    const { start, end, text } = getSelection();
    if (text) {
      // Convert selected text to list items
      const lines = text.split('\n');
      const listItems = lines.map(line => line.trim() ? `- ${line}` : line).join('\n');
      const newText = internalValue.substring(0, start) + listItems + internalValue.substring(end);
      
      setInternalValue(newText);
      onChange(newText);
      
      // Set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, start + listItems.length);
        }
      }, 0);
    } else {
      // Insert list marker at cursor
      const newText = internalValue.substring(0, start) + '- ' + internalValue.substring(start);
      setInternalValue(newText);
      onChange(newText);
      
      // Set cursor position after list marker
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + 2, start + 2);
        }
      }, 0);
    }
  };

  // Insert mention at cursor
  const insertMention = (type: 'people' | 'tasks' | 'meetings') => {
    const { start } = getSelection();
    const mentionText = type === 'people' ? '@' : type === 'tasks' ? '#' : '!';
    const newText = internalValue.substring(0, start) + mentionText + internalValue.substring(start);
    
    setInternalValue(newText);
    onChange(newText);
    
    // Set cursor position after mention symbol
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + 1, start + 1);
      }
    }, 0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-t-md">
        <button
          type="button"
          onClick={makeBold}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Bold (Ctrl+B)"
        >
          <strong className="text-sm">B</strong>
        </button>
        <button
          type="button"
          onClick={makeItalic}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Italic (Ctrl+I)"
        >
          <em className="text-sm">I</em>
        </button>
        <button
          type="button"
          onClick={makeList}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="List (Convert to bullet points)"
        >
          <span className="text-sm">•</span>
        </button>
        <button
          type="button"
          onClick={makeLink}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Link (Ctrl+L)"
        >
          <span className="text-sm">🔗</span>
        </button>
        <div className="h-4 w-px bg-gray-300 mx-2"></div>
        
        {/* Mention buttons */}
        <button
          type="button"
          onClick={() => insertMention('people')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Mention people (@)"
        >
          <span className="text-sm">@</span>
        </button>
        <button
          type="button"
          onClick={() => insertMention('tasks')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Mention tasks (#)"
        >
          <span className="text-sm">#</span>
        </button>
        <button
          type="button"
          onClick={() => insertMention('meetings')}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          title="Mention meetings (!)"
        >
          <span className="text-sm">!</span>
        </button>
        
        <div className="h-4 w-px bg-gray-300 mx-2"></div>
        <div className="text-xs text-gray-500">
          Use @ for people, # for tasks, ! for meetings
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-32 p-3 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
      />
      
      {/* Mentions display */}
      {mentions.length > 0 && (
        <div className="text-xs text-gray-500">
          <span className="font-medium">Mentions detected:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {mentions.map((mention, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs ${
                  mention.type === 'people' ? 'bg-blue-100 text-blue-800' :
                  mention.type === 'tasks' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}
              >
                {mention.text}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 flex justify-between items-center">
        <span>{internalValue.length} characters</span>
        <span className="text-gray-400">Markdown supported</span>
      </div>
    </div>
  );
};

export default RichTextEditor;
