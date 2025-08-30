import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Bold, Italic, List, Link, AtSign, Hash, Calendar, Eye, EyeOff, Save, Quote, Code, Table as TableIcon } from 'lucide-react';

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
  showHtmlInfo?: boolean;
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
  showHtmlInfo = true,
  focusMode = false,
  onFocusModeToggle,
  minHeight = '8rem',
  maxHeight = '20rem'
}, ref) => {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Parse mentions from HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const textContent = tempDiv.textContent || '';
      
      const mentionRegex = /(@[\w\s]+)|(#[\w\s]+)|(![\w\s]+)/g;
      const mentions: Mention[] = [];
      let match;

      while ((match = mentionRegex.exec(textContent)) !== null) {
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
      
      setMentions(mentions);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  // Sync external value with editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && editor && value !== editor.getHTML()) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      setAutoSaveStatus('saving');
      autoSaveTimeoutRef.current = setTimeout(() => {
        onChange(editor.getHTML());
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
  }, [editor, value, autoSave, autoSaveDelay, onChange]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
    getValue: () => editor?.getHTML() || '',
    setValue: (value: string) => {
      editor?.commands.setContent(value);
      onChange(value);
    },
    insertText: (text: string, atCursor = true) => {
      if (atCursor) {
        editor?.commands.insertContent(text);
      } else {
        editor?.commands.setContent(text);
        onChange(text);
      }
    },
    insertMention: (type: 'people' | 'tasks' | 'meetings', text = '') => {
      const mentionText = type === 'people' ? '@' : type === 'tasks' ? '#' : '!';
      const insertText = mentionText + text;
      editor?.chain().focus().insertContent(insertText).run();
    }
  }));

  // Formatting functions
  const makeBold = () => editor?.chain().focus().toggleBold().run();
  const makeItalic = () => editor?.chain().focus().toggleItalic().run();
  const makeQuote = () => editor?.chain().focus().toggleBlockquote().run();
  const makeCode = () => editor?.chain().focus().toggleCodeBlock().run();
  
  const makeLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const makeList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run();
  }, [editor]);

  const makeTable = useCallback(() => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols && editor) {
      editor.chain().focus().insertTable({ rows: parseInt(rows), cols: parseInt(cols), withHeaderRow: true }).run();
    }
  }, [editor]);

  // Insert mention at cursor
  const insertMentionAtCursor = useCallback((type: 'people' | 'tasks' | 'meetings', text = '') => {
    const mentionText = type === 'people' ? '@' : type === 'tasks' ? '#' : '!';
    const insertText = mentionText + text;
    editor?.chain().focus().insertContent(insertText).run();
  }, [editor]);

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
          disabled={disabled || !editor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeItalic}
          disabled={disabled || !editor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        
        <button
          type="button"
          onClick={makeList}
          disabled={disabled || !editor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="List (Ctrl+L)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeLink}
          disabled={disabled || !editor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Link (Ctrl+K)"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeTable}
          disabled={disabled || !editor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeQuote}
          disabled={disabled || !editor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={makeCode}
          disabled={disabled || !editor}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        
        {showMentions && (
          <>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => insertMentionAtCursor('people')}
              disabled={disabled || !editor}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mention people (@)"
            >
              <AtSign className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMentionAtCursor('tasks')}
              disabled={disabled || !editor}
              className="p-2 text-gray-600 hover:text-blue-800 hover:bg-blue-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Mention tasks (#)"
            >
              <Hash className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertMentionAtCursor('meetings')}
              disabled={disabled || !editor}
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
    makeBold, makeItalic, makeList, makeLink, makeTable, makeQuote, makeCode, insertMentionAtCursor,
    toggleFocusMode, renderAutoSaveStatus, disabled, editor, onFocusModeToggle
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
          {showCharacterCount && (
            <span>
              {editor?.getHTML()?.length || 0} characters
            </span>
          )}
          {showHtmlInfo && <span className="text-gray-400">Rich text editor</span>}
        </div>
      </div>
    );
  }, [showCharacterCount, showHtmlInfo, editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {toolbar}
      
      <div
        className={`w-full border border-gray-300 rounded-b-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 resize-none text-sm transition-all duration-200 ${
          showToolbar ? '' : 'rounded-t-md'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        style={{
          minHeight,
          maxHeight: focusMode ? 'none' : maxHeight,
          overflowY: focusMode ? 'visible' : 'auto'
        }}
      >
        <EditorContent 
          editor={editor} 
          className="p-3 prose prose-sm max-w-none"
        />
      </div>
      
      {mentionsDisplay}
      {footer}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
