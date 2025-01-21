import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocument } from '@/contexts/DocumentContext';
import { useAuth } from '@/contexts/AuthContext';
import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';
import { ExportButton } from './ExportButton';

interface EditorLayoutProps {
  documentId: string;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ documentId }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const { document, connect, disconnect } = useDocument();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('EditorLayout: User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('EditorLayout: Loading document', documentId);
        await connect(documentId);
        console.log('EditorLayout: Document loaded successfully');
      } catch (err) {
        console.error('EditorLayout: Failed to load document', err);
        if (err instanceof Error) {
          setError(err.message || 'Failed to load document. Please try again.');
        } else {
          setError('Failed to load document. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
    return () => {
      console.log('EditorLayout: Cleaning up document connection');
      disconnect();
    };
  }, [documentId, connect, disconnect, isAuthenticated, navigate]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="text-red-600 text-5xl mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xl font-semibold text-gray-800 mb-2">Error Loading Document</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !document) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg">Loading document...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 3v4a1 1 0 001 1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 17h6m-6-4h6m-6-4h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                MarkdownBuddy
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-medium text-white">{document.title}</h2>
              <span className="text-blue-200">•</span>
              <span className="text-blue-200">Last saved: {new Date(document.updatedAt).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isPreviewVisible ? 'Hide Preview' : 'Show Preview'}
            </button>
            <ExportButton documentId={documentId} documentTitle={document.title} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-8">
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          <div className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} transition-all duration-300 ease-in-out`}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-full">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Editor</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Markdown supported</span>
                  </div>
                </div>
              </div>
              <div className="h-[calc(100%-3rem)]">
                <MarkdownEditor />
              </div>
            </div>
          </div>
          
          {isPreviewVisible && (
            <div className="w-1/2 transition-all duration-300 ease-in-out">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-full">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Preview</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Live preview</span>
                    </div>
                  </div>
                </div>
                <div className="h-[calc(100%-3rem)] overflow-auto p-6">
                  <MarkdownPreview />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};