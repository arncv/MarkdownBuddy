import React, { useEffect } from 'react';
import { useDocument } from '@/contexts/DocumentContext';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

interface EditorLayoutProps {
  documentId: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ documentId }) => {
  const { document, connect, disconnect } = useDocument();

  useEffect(() => {
    connect(documentId);
    return () => disconnect();
  }, [documentId, connect, disconnect]);

  if (!document) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3v4a1 1 0 001 1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 17h6m-6-4h6m-6-4h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              MarkdownBuddy
            </h1>
            <p className="text-blue-100 mt-1">Your collaborative Markdown editor</p>
          </div>
          <h2 className="text-xl text-blue-100 font-medium">{document.title}</h2>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8">
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <MarkdownEditor />
          </div>
          <div className="flex-1 bg-white rounded-lg shadow-sm overflow-auto">
            <MarkdownPreview />
          </div>
        </div>
      </div>
    </div>
  );
};