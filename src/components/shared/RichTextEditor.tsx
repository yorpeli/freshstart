import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bold, Italic, List, Link, AtSign, Hash, Calendar, Eye, EyeOff, Save } from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
  showToolbar?: boolean;
  showMentions?: boolean;
  showCharacterCount?: boolean;
  showMarkdownInfo?: boolean;
  focusMode?: boolean;
  onFocusModeToggle?: (enabled: boolean) => void;
  minHeight?: string;
  maxHeight?: string;
}

export interface Mention {
  type: 'people' | 'tasks' | 'meetings';
  text: string;
  start: number;
  end: number;
  id?: string;
}

export interface RichTextEditorRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  insertText: (text: string, atCursor?: boolean) => void;
  insertMention: (type: 'people' | 'tasks' | 'meetings', text?: string) => void;
}

const RichTextEditor = React.forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  label,
  required = false,
  disabled = false,
  autoSave = false,
  autoSaveDelay = 3000,
  showToolbar = true,
  showMentions = true,
  showCharacterCount = true,
  showMarkdownInfo = true,
  focusMode = false,
  onFocusModeToggle,
  minHeight = '8rem',
  maxHeight = '20rem'
}, ref) => {
  const [internalValue, setInternalValue] = useState(value);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showMentionsPanel, setShowMentionsPanel] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur(),
    getValue: () => internalValue,
    setValue: (value: string) => {
      setInternalValue(value);
      onChange(value);
    },
    insertText: (text: string, atCursor = true) => {
      if (atCursor && textareaRef.current) {
        const { start, end } = getSelection();
        const newText = internalValue.substring(0, start) + text + internalValue.substring(end);
        setInternalValue(newText);
        onChange(newText);
        
        // Set cursor position after inserted text
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(start + text.length, start + text.length);
          }
        }, 0);
      } else {
        setInternalValue(text);
        onChange(text);
      }
    },
    insertMention: (type: 'people' | 'tasks' | 'meetings', text = '') => {
      insertMentionAtCursor(type, text);
    }
  }));

  // Sync internal value with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Parse mentions from text with enhanced regex
  const parseMentions = useCallback((text: string): Mention[] => {
    const mentionRegex = /(@[\w\s]+)|(#[\w\s]+)|(![\w\s]+)/g;
    const mentions: Mention[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const type = match[0].startsWith('@') ? 'people' : 
                   match[0].startsWith('#') ? 'tasks' : 'meetings';
      
      mentions.push({
        type,
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        id: `${type}_${match.index}_${Date.now()}`
      });
    }

    return mentions;
  }, []);

  // Update mentions when text changes
  useEffect(() => {
    const newMentions = parseMentions(internalValue);
    setMentions(newMentions);
  }, [internalValue, parseMentions]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && internalValue !== value) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      setAutoSaveStatus('saving');
      autoSaveTimeoutRef.current = setTimeout(() => {
        onChange(internalValue);
        setAutoSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [internalValue, value, autoSave, autoSaveDelay, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    // Only call onChange immediately if auto-save is disabled
    if (!autoSave) {
      onChange(newValue);
    }
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
  const applyFormatting = useCallback((before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { start, end, text } = getSelection();
    const newText = internalValue.substring(0, start) + before + text + after + internalValue.substring(end);
    
    setInternalValue(newText);
    if (!autoSave) onChange(newText);
    
    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + text.length);
    }, 0);
  }, [internalValue, onChange, autoSave]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        case 'k':
          e.preventDefault();
          makeLink();
          break;
        case 'l':
          e.preventDefault();
          makeList();
          break;
        case 's':
          e.preventDefault();
          if (autoSave) {
            onChange(internalValue);
            setAutoSaveStatus('saved');
            setTimeout(() => setAutoSaveStatus('idle'), 2000);
          }
          break;
      }
    }
  }, [applyFormatting, autoSave, onChange, internalValue]);

  // Formatting functions
  const makeBold = () => applyFormatting('**', '**');
  const makeItalic = () => applyFormatting('*', '*');
  
  const makeLink = useCallback(() => {
    const { start, end, text } = getSelection();
    if (text) {
      // If text is selected, wrap it in a link
      const linkText = prompt('Enter link text (or press Enter to use selected text):', text);
      if (linkText === null) return; // User cancelled
      
      const url = prompt('Enter URL:');
      if (url === null) return; // User cancelled
      
      const linkMarkdown = `[${linkText || text}](${url})`;
      const newText = internalValue.substring(0, start) + linkMarkdown + internalValue.substring(end);
      
      setInternalValue(newText);
      if (!autoSave) onChange(newText);
      
      // Set cursor position after the link
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
        }
      }, 0);
    } else {
      // If no text selected, insert a link template
      const linkText = prompt('Enter link text:');
      if (linkText === null) return; // User cancelled
      
      const url = prompt('Enter URL:');
      if (url === null) return; // User cancelled
      
      const linkMarkdown = `[${linkText}](${url})`;
      const newText = internalValue.substring(0, start) + linkMarkdown + internalValue.substring(start);
      
      setInternalValue(newText);
      if (!autoSave) onChange(newText);
      
      // Set cursor position after the link
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
        }
      }, 0);
    }
  }, [internalValue, onChange, autoSave]);

  const makeList = useCallback(() => {
    const { start, end, text } = getSelection();
    if (text) {
      // Convert selected text to list items
      const lines = text.split('\n');
      const listItems = lines.map(line => line.trim() ? `- ${line}` : line).join('\n');
      const newText = internalValue.substring(0, start) + listItems + internalValue.substring(end);
      
      setInternalValue(newText);
      if (!autoSave) onChange(newText);
      
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
      if (!autoSave) onChange(newText);
      
      // Set cursor position after list marker
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + 2, start + 2);
        }
      }, 0);
    }
  }, [internalValue, onChange, autoSave]);

  // Insert mention at cursor
  const insertMentionAtCursor = useCallback((type: 'people' | 'tasks' | 'meetings', text = '') => {
    const { start } = getSelection();
    const mentionText = type === 'people' ? '@' : type === 'tasks' ? '#' : '!';
    const insertText = mentionText + text;
    const newText = internalValue.substring(0, start) + insertText + internalValue.substring(start);
    
    setInternalValue(newText);
    if (!autoSave) onChange(newText);
    
    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + insertText.length, start + insertText.length);
      }
    }, 0);
  }, [internalValue, onChange, autoSave]);

  // Auto-convert URLs to markdown links
  const convertUrlsToLinks = useCallback(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let newText = internalValue;
    let match;
    let offset = 0;
    
    while ((match = urlRegex.exec(internalValue)) !== null) {
      const url = match[1];
      const start = match.index + offset;
      const end = start + url.length;
      
      // Check if this URL is already in a markdown link
      const beforeText = newText.substring(0, start);
      const afterText = newText.substring(end);
      
      // If it's not already a markdown link, convert it
      if (!beforeText.match(/\[[^\]]*\]\([^)]*$/)) {
        const linkMarkdown = `[${url}](${url})`;
        newText = beforeText + linkMarkdown + afterText;
        offset += linkMarkdown.length - url.length;
      }
    }
    
    if (newText !== internalValue) {
      setInternalValue(newText);
      if (!autoSave) onChange(newText);
    }
  }, [internalValue, onChange, autoSave]);

  // Handle paste events to auto-convert URLs
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Check if pasted text contains URLs
    if (pastedText.match(/https?:\/\/[^\s]+/)) {
      // Let the paste happen, then convert URLs
      setTimeout(() => {
        convertUrlsToLinks();
      }, 0);
    }
  }, [convertUrlsToLinks]);

  // Focus mode toggle
  const toggleFocusMode = useCallback(() => {
    const newFocusMode = !focusMode;
    onFocusModeToggle?.(newFocusMode);
  }, [focusMode, onFocusModeToggle]);

  // Auto-save status indicator
  const renderAutoSaveStatus = () => {
    if (!autoSave) return null;
    
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-1 text-blue-600">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <Save className="w-3 h-3" />
            <span className="text-xs">Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <span className="text-xs">Save failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Memoized toolbar
  const toolbar = useMemo(() => {
    if (!showToolbar) return null;

    return (
      <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-md">
        <button
          type="button"
          onClick={makeBold}
          disabled={disabled}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeItalic}
          disabled={disabled}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeList}
          disabled={disabled}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="List (Ctrl+L)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeLink}
          disabled={disabled}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Link (Ctrl+K)"
        >
          <Link className="w-4 h-4" />
        </button>
        
        {showMentions && (
          <>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => insertMentionAtCursor('people')}
              disabled={disabled}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mention people (@)"
            >
              <AtSign className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMentionAtCursor('tasks')}
              disabled={disabled}
              className="p-2 text-gray-600 hover:text-blue-800 hover:bg-blue-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mention tasks (#)"
            >
              <Hash className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMentionAtCursor('meetings')}
              disabled={disabled}
              className="p-2 text-gray-600 hover:text-purple-800 hover:bg-purple-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mention meetings (!)"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </>
        )}
        
        {onFocusModeToggle && (
          <>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={toggleFocusMode}
              disabled={disabled}
              className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                focusMode 
                  ? 'text-blue-600 bg-blue-100 hover:bg-blue-200' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
              title="Toggle focus mode"
            >
              {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </>
        )}
        
        {autoSave && (
          <>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            {renderAutoSaveStatus()}
          </>
        )}
      </div>
    );
  }, [
    showToolbar, showMentions, focusMode, autoSave, autoSaveStatus,
    makeBold, makeItalic, makeList, makeLink, insertMentionAtCursor,
    toggleFocusMode, renderAutoSaveStatus, disabled, onFocusModeToggle
  ]);

  // Memoized mentions display
  const mentionsDisplay = useMemo(() => {
    if (!showMentions || mentions.length === 0) return null;

    return (
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
        <span className="font-medium">Mentions detected:</span>
        <div className="flex flex-wrap gap-1 mt-1">
          {mentions.map((mention) => (
            <span
              key={mention.id}
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
    );
  }, [showMentions, mentions]);

  // Memoized footer
  const footer = useMemo(() => {
    return (
      <div className="text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showCharacterCount && <span>{internalValue.length} characters</span>}
          {showMarkdownInfo && <span className="text-gray-400">Markdown supported</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={convertUrlsToLinks}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-800 text-xs underline disabled:opacity-50 disabled:cursor-not-allowed"
            title="Convert URLs to clickable links"
          >
            Convert URLs
          </button>
        </div>
      </div>
    );
  }, [showCharacterCount, showMarkdownInfo, internalValue.length, convertUrlsToLinks, disabled]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {toolbar}
      
      <textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full p-3 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm transition-all duration-200 ${
          showToolbar ? '' : 'rounded-t-md'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${
          isFocused ? 'border-blue-500' : ''
        }`}
        style={{
          minHeight,
          maxHeight: focusMode ? 'none' : maxHeight
        }}
      />
      
      {mentionsDisplay}
      {footer}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
