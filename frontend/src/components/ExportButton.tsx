import React, { useState, useCallback, useEffect, useRef } from 'react';
import api from '@/utils/api';

interface ExportButtonProps {
  documentId: string;
  documentTitle: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ documentId, documentTitle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleExport = async (format: 'pdf' | 'html' | 'docx') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/documents/${documentId}/export/${format}`, {
        responseType: 'blob'
      });

      // Create and click a temporary download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      const sanitizedTitle = documentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.href = url;
      link.download = `${sanitizedTitle}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch (error) {
      setError('Failed to export document. Please try again.');
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isLoading}
      >
        <svg 
          className="mr-2 h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        {isLoading ? 'Exporting...' : 'Export'}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10">
          <div className="py-1">
            <button
              onClick={() => handleExport('pdf')}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export as PDF
            </button>
            <button
              onClick={() => handleExport('html')}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Export as HTML
            </button>
            <button
              onClick={() => handleExport('docx')}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as DOCX
            </button>
          </div>
        </div>
      )}

      {error && (
        <div 
          className="absolute top-0 right-0 mt-12 w-64 bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm"
          onClick={clearError}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};