import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDocument } from '@/contexts/DocumentContext';
import { EditorLayout } from '@/components/EditorLayout';
import { ExportButton } from '@/components/ExportButton';

export const DocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { document, connect, disconnect } = useDocument();

  useEffect(() => {
    if (id) {
      connect(id);
    }
    return () => disconnect();
  }, [id, connect, disconnect]);

  if (!id || !document) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
            <ExportButton documentId={document.id} documentTitle={document.title} />
          </div>
          <EditorLayout documentId={id} />
        </div>
      </div>
    </div>
  );
};