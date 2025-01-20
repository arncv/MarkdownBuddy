import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useDocument } from '@/contexts/DocumentContext';

export const MarkdownPreview: React.FC = () => {
  const { document } = useDocument();

  return (
    <div className="p-8 prose prose-lg max-w-none h-full overflow-auto">
      <div className="mb-4 pb-2 border-b border-gray-200">
        <h2 className="text-gray-500 text-sm font-medium">Preview</h2>
      </div>
      <article className="prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-600 prose-a:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
        <ReactMarkdown>
          {document?.content || '# Welcome to MarkdownBuddy! 📝\n\nStart writing in the editor to see your content come to life here.\n\n## Features\n\n- Real-time collaboration\n- Live preview\n- Markdown syntax highlighting'}
        </ReactMarkdown>
      </article>
    </div>
  );
};