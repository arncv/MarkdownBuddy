import express from 'express';
import { auth } from '../middleware/auth.js';
import { z } from 'zod';
import { store } from '../utils/store.js';

const router = express.Router();

// Request logging middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Query:', req.query);
  console.log('Params:', req.params);
  next();
});

// Input validation schemas
const createDocumentSchema = z.object({
  title: z.string().min(1)
});

const updateDocumentSchema = z.object({
  content: z.string().optional(),
  version: z.number(),
  title: z.string().min(1).optional()
});

// Create new document
router.post('/', auth, async (req, res) => {
  console.log('Creating document...');
  console.log('User ID:', req.userId);
  console.log('Request body:', req.body);

  try {
    const { title } = createDocumentSchema.parse(req.body);
    console.log('Validated title:', title);

    const document = await store.createDocument({
      title,
      content: '',
      owner: req.userId,
      collaborators: [req.userId],
      version: 0
    });

    console.log('Created document:', document);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors[0].message;
      console.error('Validation error:', errorMessage);
      return res.status(400).json({ message: errorMessage });
    }
    res.status(500).json({ message: 'Failed to create document' });
  }
});

// Get document by id
router.get('/:id', auth, async (req, res) => {
  console.log(`Fetching document: ${req.params.id}`);
  try {
    const document = await store.findDocumentById(req.params.id);

    if (!document) {
      console.log('Document not found:', req.params.id);
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.collaborators.includes(req.userId)) {
      console.log('Access denied for user:', req.userId);
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log('Found document:', document);
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// Update document
router.patch('/:id', auth, async (req, res) => {
  console.log(`Updating document: ${req.params.id}`);
  console.log('Update data:', req.body);

  try {
    const { content, version, title } = updateDocumentSchema.parse(req.body);

    const document = await store.findDocumentById(req.params.id);
    if (!document) {
      console.log('Document not found:', req.params.id);
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.collaborators.includes(req.userId)) {
      console.log('Access denied for user:', req.userId);
      return res.status(403).json({ message: 'Access denied' });
    }

    if (document.version !== version) {
      console.log('Version mismatch:', { current: document.version, received: version });
      return res.status(409).json({ 
        message: 'Version mismatch',
        currentVersion: document.version 
      });
    }

    const updates: any = {
      version: version + 1,
      updatedAt: new Date()
    };

    if (content !== undefined) updates.content = content;
    if (title !== undefined) updates.title = title;

    const updated = await store.updateDocument(req.params.id, updates);
    console.log('Document updated:', updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// List user's documents
router.get('/', auth, async (req, res) => {
  console.log('Listing documents for user:', req.userId);
  try {
    const documents = await store.findDocumentsByUserId(req.userId);
    console.log('Found documents:', documents);
    res.json(documents);
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Add collaborator
router.post('/:id/collaborators', auth, async (req, res) => {
  console.log(`Adding collaborator to document: ${req.params.id}`);
  try {
    const document = await store.findDocumentById(req.params.id);
    if (!document) {
      console.log('Document not found:', req.params.id);
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.owner !== req.userId) {
      console.log('Access denied for user:', req.userId);
      return res.status(403).json({ message: 'Only owner can add collaborators' });
    }

    const collaboratorEmail = z.string().email().parse(req.body.email);
    const collaborator = await store.findUserByEmail(collaboratorEmail);

    if (!collaborator) {
      console.log('Collaborator not found:', collaboratorEmail);
      return res.status(404).json({ message: 'User not found' });
    }

    if (document.collaborators.includes(collaborator.id)) {
      console.log('User already a collaborator:', collaboratorEmail);
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    const updated = await store.addCollaborator(req.params.id, collaborator.id);
    console.log('Added collaborator:', { document: updated, collaborator: collaborator.email });
    res.json(updated);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to add collaborator' });
  }
});

export default router;