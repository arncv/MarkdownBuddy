import React from 'react';
import { useParams } from 'react-router-dom';
import { DocumentProvider } from '@/contexts/DocumentContext';
import { EditorLayout } from '@/components/EditorLayout';

export const DocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="flex justify-center items-center h-screen">
        Document not found
      </div>
    );
  }

  return (
    <DocumentProvider>
      <EditorLayout documentId={id} />
    </DocumentProvider>
  );
};