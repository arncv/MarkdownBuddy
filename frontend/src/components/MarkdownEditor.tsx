import React, { useCallback, useState, useEffect } from 'react';
import { useDocument } from '@/contexts/DocumentContext';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';

export const MarkdownEditor: React.FC = () => {
  const { document, updateDocument } = useDocument();
  const [localContent, setLocalContent] = useState(document?.content || '');
  const [updateTimer, setUpdateTimer] = useState<NodeJS.Timeout>();

  // Sync local content when document changes from server
  useEffect(() => {
    if (document?.content !== undefined) {
      setLocalContent(document.content);
    }
  }, [document?.content]);

  const debouncedUpdate = useCallback((content: string) => {
    // Clear any pending updates
    if (updateTimer) {
      clearTimeout(updateTimer);
    }

    // Set new timer for server update
    const timer = setTimeout(() => {
      updateDocument(content);
    }, 500); // 500ms debounce

    setUpdateTimer(timer);
  }, [updateDocument]);

  const handleChange = useCallback((value: string) => {
    // Update local state immediately for responsive UI
    setLocalContent(value);
    // Debounce server update
    debouncedUpdate(value);
  }, [debouncedUpdate]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (updateTimer) {
        clearTimeout(updateTimer);
      }
    };
  }, [updateTimer]);

  const placeholder = `# Start writing in Markdown

Use Markdown syntax to format your text:
- Use # for headings
- Use * or _ for *italics* or **bold**
- Use - or * for bullet points
- Use 1. 2. 3. for numbered lists
- Use > for blockquotes
- Use \`\`\` for code blocks`;

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 flex-1 relative">
        <div className="mb-4 pb-2 border-b border-gray-200">
          <h2 className="text-gray-500 text-sm font-medium">Editor</h2>
        </div>
        <CodeMirror
          value={localContent}
          height="calc(100% - 3rem)"
          theme="light"
          extensions={[markdown()]}
          onChange={handleChange}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
          }}
          className="w-full rounded-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  );
};