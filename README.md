# Collaborative Markdown Editor

A real-time collaborative Markdown editor with live preview and presence indicators.

## Features

- Real-time collaborative editing
- Live Markdown preview
- User presence indicators
- Document version history
- JWT authentication
- Responsive design

## Tech Stack

### Frontend
- React + TypeScript
- CodeMirror for editor
- Socket.IO for real-time collaboration
- TailwindCSS for styling

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Socket.IO for WebSocket communication
- JWT for authentication

## Project Structure

```
collaborative-markdown-editor/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── services/  # API services
│   │   ├── contexts/  # React contexts
│   │   └── types/     # TypeScript types
└── backend/           # Express backend
    ├── src/
    │   ├── controllers/
    │   ├── services/
    │   ├── models/
    │   ├── middleware/
    │   └── routes/
```

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas connection string
- npm or yarn package manager

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install        # Install root dependencies
   cd frontend
   npm install       # Install frontend dependencies
   cd ../backend
   npm install       # Install backend dependencies
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the values as needed

4. Start MongoDB:
   ```bash
   # Make sure MongoDB is running locally or update MONGODB_URI in backend/.env
   ```

5. Start the development servers:
   ```bash
   # In root directory
   npm run dev       # Starts both frontend and backend
   ```

   Or separately:
   ```bash
   # Frontend (http://localhost:5173)
   cd frontend
   npm run dev

   # Backend (http://localhost:3000)
   cd backend
   npm run dev
   ```

## API Documentation

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Documents

```
GET    /api/documents         # List documents
POST   /api/documents         # Create document
GET    /api/documents/:id     # Get document
PATCH  /api/documents/:id     # Update document
POST   /api/documents/:id/collaborators  # Add collaborator
```

## WebSocket Events

```typescript
// Document updates
socket.emit('document_update', {
  documentId: string;
  patch: PatchOperation[];
  version: number;
  userId: string;
});

// Presence updates
socket.emit('presence_update', {
  documentId: string;
  userId: string;
  cursor: { line: number; ch: number };
  timestamp: number;
});
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details