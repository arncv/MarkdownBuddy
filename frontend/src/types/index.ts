export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  version: number;
  owner: string;
  collaborators: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUpdate {
  documentId: string;
  patch: { type: 'insert' | 'delete' | 'retain'; chars?: string; count?: number }[];
  version: number;
  userId: string;
}

export interface UserPresence {
  documentId: string;
  userId: string;
  cursor: { line: number; ch: number };
  timestamp: number;
}

export interface DocumentState {
  document: Document | null;
  version: number;
  pendingUpdates: DocumentUpdate[];
  collaborators: UserPresence[];
  lastServerUpdate: number;
}