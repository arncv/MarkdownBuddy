import React, { useCallback, useState, useEffect } from 'react';
import { useDocument } from '@/contexts/DocumentContext';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';

interface ToolbarButton {
  label: string;
  icon: JSX.Element;
  action: (text: string) => string;
  shortcut: string;
}

export const MarkdownEditor: React.FC = () => {
  const { document, updateDocument, isLoading, error } = useDocument();
  const [localContent, setLocalContent] = useState(document?.content || '');
  const [view, setView] = useState<EditorView | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local content when document changes from server
  useEffect(() => {
    if (document?.content !== undefined && !isSaving) {
      setLocalContent(document.content);
    }
  }, [document?.content, isSaving]);

  const handleChange = useCallback(async (value: string) => {
    setLocalContent(value);
    try {
      setIsSaving(true);
      await updateDocument(value);
    } finally {
      setIsSaving(false);
    }
  }, [updateDocument]);

  const insertText = useCallback((transform: (text: string) => string) => {
    if (!view) return;

    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    const newText = transform(selectedText);

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: newText
      },
      selection: { anchor: selection.from + newText.length }
    });

    // Ensure the inserted text is synced
    const updatedContent = view.state.doc.toString();
    handleChange(updatedContent);
  }, [view, handleChange]);

  const toolbarButtons: ToolbarButton[] = [
    {
      label: 'Bold',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 000-8H6v8zm0 0h8a4 4 0 010 8H6v-8z" />
        </svg>
      ),
      action: (text) => `**${text || 'bold text'}**`,
      shortcut: 'Ctrl+B'
    },
    {
      label: 'Italic',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 16M6 16l8-8M6 8l8 8" />
        </svg>
      ),
      action: (text) => `*${text || 'italic text'}*`,
      shortcut: 'Ctrl+I'
    },
    {
      label: 'Link',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      action: (text) => `[${text || 'link text'}](url)`,
      shortcut: 'Ctrl+K'
    },
    {
      label: 'Code',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 16M6 16l8-8M6 8l8 8" />
        </svg>
      ),
      action: (text) => `\`${text || 'code'}\``,
      shortcut: 'Ctrl+E'
    },
    {
      label: 'Heading',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      action: (text) => `# ${text || 'Heading'}`,
      shortcut: 'Ctrl+H'
    }
  ];

  const placeholder = `# Start writing in Markdown

Use Markdown syntax to format your text:
- Use # for headings
- Use * or _ for *italics* or **bold**
- Use - or * for bullet points
- Use 1. 2. 3. for numbered lists
- Use > for blockquotes
- Use \`\`\` for code blocks`;

  return (
    <div className="h-full flex flex-col relative">
      {/* Status Bar */}
      {(isLoading || isSaving || error) && (
        <div className={`absolute top-0 left-0 right-0 z-10 px-4 py-2 text-sm ${
          error ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
        }`}>
          {error ? error : (isLoading ? 'Loading...' : 'Saving...')}
        </div>
      )}

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
        {toolbarButtons.map((button) => (
          <button
            key={button.label}
            onClick={() => insertText(button.action)}
            className={`
              p-2 rounded-md transition-colors duration-150 group relative
              ${isLoading || isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}
            `}
            disabled={isLoading || isSaving}
            title={`${button.label} (${button.shortcut})`}
          >
            {button.icon}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {button.shortcut}
            </span>
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={localContent}
          height="100%"
          theme="light"
          extensions={[
            markdown(),
            EditorView.lineWrapping,
            EditorView.theme({
              "&": {
                fontSize: "14px",
                height: "100%"
              },
              ".cm-content": {
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                padding: "1rem"
              },
              ".cm-line": {
                lineHeight: "1.6"
              }
            })
          ]}
          onChange={handleChange}
          placeholder={placeholder}
          onCreateEditor={(view) => setView(view)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true
          }}
          className="h-full focus:outline-none"
        />
      </div>
    </div>
  );
};