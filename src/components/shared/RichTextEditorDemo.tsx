import React, { useState, useRef } from 'react';
import RichTextEditor, { RichTextEditorRef } from './RichTextEditor';

const RichTextEditorDemo: React.FC = () => {
  const [values, setValues] = useState({
    basic: 'This is a basic rich text editor with markdown support.',
    withLabel: 'This editor has a label and is required.',
    autoSave: 'This editor has auto-save enabled (3 second delay).',
    focusMode: 'This editor supports focus mode for distraction-free writing.',
    minimal: 'This is a minimal editor with no toolbar or mentions.',
    customHeight: 'This editor has custom height settings and shows character count.'
  });

  const [focusMode, setFocusMode] = useState(false);
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleChange = (field: string) => (value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleFocusModeToggle = (enabled: boolean) => {
    setFocusMode(enabled);
  };

  const insertSampleText = () => {
    editorRef.current?.insertText('Sample text inserted at cursor!');
  };

  const insertMention = () => {
    editorRef.current?.insertMention('people', 'john_doe');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RichTextEditor Demo</h1>
        <p className="text-gray-600">Testing all features of the enhanced shared component</p>
      </div>

      {/* Basic Editor */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Editor</h2>
        <RichTextEditor
          value={values.basic}
          onChange={handleChange('basic')}
          placeholder="Start typing here..."
        />
      </div>

      {/* Editor with Label and Required */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Editor with Label and Required</h2>
        <RichTextEditor
          value={values.withLabel}
          onChange={handleChange('withLabel')}
          label="Meeting Notes"
          required={true}
          placeholder="Enter your meeting notes..."
        />
      </div>

      {/* Auto-save Editor */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Auto-save Editor</h2>
        <RichTextEditor
          value={values.autoSave}
          onChange={handleChange('autoSave')}
          autoSave={true}
          autoSaveDelay={3000}
          placeholder="This will auto-save every 3 seconds..."
        />
      </div>

      {/* Focus Mode Editor */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Focus Mode Editor</h2>
        <RichTextEditor
          value={values.focusMode}
          onChange={handleChange('focusMode')}
          focusMode={focusMode}
          onFocusModeToggle={handleFocusModeToggle}
          placeholder="Toggle focus mode for distraction-free writing..."
        />
        <div className="mt-2 text-sm text-gray-600">
          Focus mode: {focusMode ? 'ON' : 'OFF'}
        </div>
      </div>

      {/* Minimal Editor */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Minimal Editor</h2>
        <RichTextEditor
          value={values.minimal}
          onChange={handleChange('minimal')}
          showToolbar={false}
          showMentions={false}
          showCharacterCount={false}
          showMarkdownInfo={false}
          placeholder="Clean, minimal interface..."
        />
      </div>

      {/* Custom Height Editor */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Height Editor</h2>
        <RichTextEditor
          value={values.customHeight}
          onChange={handleChange('customHeight')}
          minHeight="12rem"
          maxHeight="16rem"
          showCharacterCount={true}
          placeholder="This editor has custom height settings..."
        />
      </div>

      {/* Ref Methods Demo */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ref Methods Demo</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={insertSampleText}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Insert Sample Text
          </button>
          <button
            onClick={insertMention}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Insert @mention
          </button>
          <button
            onClick={() => editorRef.current?.focus()}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Focus Editor
          </button>
        </div>
        <RichTextEditor
          ref={editorRef}
          value={values.basic}
          onChange={handleChange('basic')}
          placeholder="Use the buttons above to test ref methods..."
        />
      </div>

      {/* Current Values Display */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(values).map(([key, value]) => (
            <div key={key} className="bg-white p-3 rounded border">
              <h3 className="font-medium text-gray-700 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                {value || '(empty)'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditorDemo;
