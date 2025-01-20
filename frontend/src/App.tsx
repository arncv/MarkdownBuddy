import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { DocumentListPage } from '@/pages/DocumentListPage';
import { DocumentPage } from '@/pages/DocumentPage';
import { PrivateRoute } from '@/components/PrivateRoute';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <DocumentListPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <PrivateRoute>
            <DocumentPage />
          </PrivateRoute>
        }
      />
      
      {/* Redirect root to documents */}
      <Route path="/" element={<Navigate to="/documents" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/documents" replace />} />
    </Routes>
  );
};

export default App;