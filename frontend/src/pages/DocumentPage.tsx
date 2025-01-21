import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentProvider } from '@/contexts/DocumentContext';
import { EditorLayout } from '@/components/EditorLayout';
import { useAuth } from '@/contexts/AuthContext';

export const DocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('DocumentPage: User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (!id) {
      console.log('DocumentPage: No document ID provided');
      navigate('/documents');
      return;
    }

    setIsLoading(false);
  }, [id, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500">Checking authentication...</div>
        </div>
      </div>
    );
  }

  if (!id || !isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return (
    <DocumentProvider>
      <EditorLayout documentId={id} />
    </DocumentProvider>
  );
};