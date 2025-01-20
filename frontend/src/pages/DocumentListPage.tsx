import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Document } from '@/types';
import api from '@/utils/api';

export const DocumentListPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      console.log('Fetching documents...');
      const response = await api.get('/documents');
      console.log('Documents response:', response.data);
      setDocuments(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to fetch documents');
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDocTitle.trim()) {
      return;
    }

    try {
      const response = await api.post('/documents', { title: newDocTitle });
      if (response.data && response.data.id) {
        navigate(`/documents/${response.data.id}`);
      } else {
        setError('Failed to create document: Invalid server response');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create document');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 3v4a1 1 0 001 1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 17h6m-6-4h6m-6-4h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                MarkdownBuddy
              </h1>
              <p className="mt-1 text-blue-100">Your documents, anywhere, anytime</p>
            </div>
            <form onSubmit={handleCreateDocument} className="flex gap-2">
              <input
                type="text"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Enter document title"
                className="px-4 py-2 rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600"
              />
              <button 
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                New Document
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading your documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new document.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map(doc => (
              <Link 
                key={doc.id} 
                to={`/documents/${doc.id}`}
                className="relative block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  {doc.collaborators.length} collaborators
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};