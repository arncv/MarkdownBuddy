import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Document, DocumentState } from '@/types';
import api from '@/utils/api';

interface DocumentContextType extends DocumentState {
  connect: (documentId: string) => Promise<void>;
  disconnect: () => void;
  updateDocument: (content: string) => void;
}

const DocumentContext = createContext<DocumentContextType | null>(null);

const initialState: DocumentState = {
  document: null,
  version: 0,
  pendingUpdates: [],
  collaborators: [],
  lastServerUpdate: 0
};

type DocumentAction =
  | { type: 'SET_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_CONTENT'; payload: { content: string; isLocal: boolean } }
  | { type: 'SET_VERSION'; payload: number }
  | { type: 'UPDATE_SERVER_TIMESTAMP' }
  | { type: 'RESET' };

function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return {
        ...state,
        document: action.payload,
        version: action.payload.version,
        lastServerUpdate: Date.now()
      };
    case 'UPDATE_CONTENT':
      if (!state.document) return state;
      
      const newVersion = action.payload.isLocal ? state.version : state.version + 1;
      return {
        ...state,
        document: {
          ...state.document,
          content: action.payload.content,
          version: newVersion
        },
        version: newVersion,
        lastServerUpdate: action.payload.isLocal ? state.lastServerUpdate : Date.now()
      };
    case 'SET_VERSION':
      return {
        ...state,
        version: action.payload
      };
    case 'UPDATE_SERVER_TIMESTAMP':
      return {
        ...state,
        lastServerUpdate: Date.now()
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);
  const socketRef = React.useRef<Socket>();
  const debug = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';

  const connect = useCallback(async (documentId: string) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      dispatch({ type: 'SET_DOCUMENT', payload: response.data });

      if (debug) {
        console.log('DocumentContext: Loaded document', response.data);
      }

      socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
        query: { documentId }
      });

      socketRef.current.on('document_update', (data: { content: string, version: number }) => {
        if (debug) {
          console.log('DocumentContext: Received update', data);
        }
        dispatch({
          type: 'UPDATE_CONTENT',
          payload: { content: data.content, isLocal: false }
        });
      });

      socketRef.current.emit('join_document', documentId);
    } catch (error) {
      console.error('DocumentContext: Failed to connect', error);
    }
  }, [debug]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    dispatch({ type: 'RESET' });
  }, []);

  const updateDocument = useCallback(async (content: string) => {
    if (!state.document) {
      console.error('DocumentContext: No active document');
      return;
    }

    // Update local state immediately
    dispatch({
      type: 'UPDATE_CONTENT',
      payload: { content, isLocal: true }
    });

    // Don't send updates too frequently
    const timeSinceLastUpdate = Date.now() - state.lastServerUpdate;
    if (timeSinceLastUpdate < 500) {
      if (debug) {
        console.log('DocumentContext: Skipping server update, too soon');
      }
      return;
    }

    try {
      const response = await api.patch(`/documents/${state.document.id}`, {
        content,
        version: state.version
      });

      if (debug) {
        console.log('DocumentContext: Updated document', response.data);
      }

      // Update state with server response
      dispatch({
        type: 'UPDATE_CONTENT',
        payload: { content: response.data.content, isLocal: false }
      });

      if (socketRef.current) {
        socketRef.current.emit('document_update', {
          documentId: state.document.id,
          content,
          version: state.version + 1
        });
      }
    } catch (error) {
      if (debug) {
        console.error('DocumentContext: Update failed', error);
      }
      
      // Refresh document to get latest version
      connect(state.document.id);
    }
  }, [state.document, state.version, state.lastServerUpdate, connect, debug]);

  return (
    <DocumentContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        updateDocument
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};