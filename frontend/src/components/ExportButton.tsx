import React, { useState, useCallback, useEffect, useRef } from 'react';
import api from '@/utils/api';

interface ExportButtonProps {
  documentId: string;
  documentTitle: string;
}

type ExportFormat = {
  id: 'pdf' | 'html' | 'docx';
  label: string;
  icon: JSX.Element;
  description: string;
};

export const ExportButton: React.FC<ExportButtonProps> = ({ documentId, documentTitle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      label: 'PDF Document',
      description: 'Best for printing and sharing',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'html',
      label: 'HTML Webpage',
      description: 'For web publishing',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'docx',
      label: 'Word Document',
      description: 'For further editing',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

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
      setActiveFormat(format);
      
      const response = await api.get(`/documents/${documentId}/export/${format}`, {
        responseType: 'blob'
      });

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
      setActiveFormat(null);
    } catch (error) {
      setError('Failed to export document. Please try again.');
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setActiveFormat(null), 1000); // Clear active format after animation
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
        disabled={isLoading}
      >
        <svg 
          className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
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
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10 overflow-hidden">
          <div className="p-2">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                disabled={isLoading}
                className={`
                  group flex items-center w-full px-3 py-2.5 text-sm rounded-md
                  ${activeFormat === format.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                  transition-all duration-200
                `}
              >
                <span className={`
                  flex-shrink-0 mr-3
                  ${activeFormat === format.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `}>
                  {format.icon}
                </span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{format.label}</span>
                  <span className={`
                    text-xs
                    ${activeFormat === format.id ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                    {format.description}
                  </span>
                </div>
                {isLoading && activeFormat === format.id && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div 
          className="absolute top-0 right-0 mt-12 w-72 bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm shadow-lg transform transition-all duration-200 ease-out"
          onClick={clearError}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="mt-1 text-xs text-red-700">Click to dismiss</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};