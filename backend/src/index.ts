import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { store } from './utils/store.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_document', async (documentId: string) => {
    const document = await store.findDocumentById(documentId);
    if (document) {
      socket.join(documentId);
      console.log(`Client ${socket.id} joined document: ${documentId}`);
    }
  });

  socket.on('document_update', async (update: any) => {
    const document = await store.findDocumentById(update.documentId);
    if (document) {
      await store.updateDocument(update.documentId, { content: update.content });
      socket.to(update.documentId).emit('document_update', update);
    }
  });

  socket.on('presence_update', (presence: any) => {
    socket.to(presence.documentId).emit('presence_update', presence);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Import routes
import authRouter from './routes/auth.js';
import documentsRouter from './routes/documents.js';

// Apply routes
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

// Initialize store with some test data
const initializeStore = async () => {
  const testUser = await store.createUser({
    email: 'test@example.com',
    passwordHash: '$2a$10$test'
  });

  await store.createDocument({
    title: 'Welcome Document',
    content: '# Welcome to Collaborative Markdown Editor\n\nStart editing this document to test the collaboration features!',
    owner: testUser.id,
    collaborators: [testUser.id]
  });
};

httpServer.listen(PORT, async () => {
  await initializeStore();
  console.log(`Server running on port ${PORT}`);
  console.log('Test user created: test@example.com');
});