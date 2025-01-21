import express from 'express';
import auth from '../middleware/auth.js';
import { z } from 'zod';
import { store } from '../utils/store.js';
import { ExportService } from '../services/exportService.js';

const router = express.Router();
const exportService = new ExportService();

// Request logging middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
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
  try {
    const { title } = createDocumentSchema.parse(req.body);
    console.log('Creating document:', { title, userId: req.userId });

    const document = await store.createDocument({
      title,
      content: '',
      owner: req.userId,
      collaborators: [req.userId],
      version: 0
    });

    console.log('Document created:', document);
    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: error.errors[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    res.status(500).json({ 
      message: 'Failed to create document',
      code: 'SERVER_ERROR'
    });
  }
});

// Get document by id
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;
  console.log('Fetching document:', { id, userId: req.userId });

  try {
    // Verify authentication
    if (!req.userId) {
      console.error('Authentication missing');
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const document = await store.findDocumentById(id);

    if (!document) {
      console.log('Document not found:', id);
      return res.status(404).json({ 
        message: 'Document not found',
        code: 'DOC_NOT_FOUND'
      });
    }

    if (!document.collaborators.includes(req.userId)) {
      console.log('Access denied:', { userId: req.userId, documentId: id });
      return res.status(403).json({ 
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    console.log('Document fetched successfully:', {
      id: document.id,
      title: document.title,
      version: document.version
    });

    res.json({
      ...document,
      currentUser: req.userId,
      userRole: document.owner === req.userId ? 'owner' : 'collaborator'
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ 
      message: 'Failed to fetch document',
      code: 'SERVER_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update document
router.patch('/:id', auth, async (req, res) => {
  const { id } = req.params;
  console.log('Updating document:', { id, userId: req.userId });

  try {
    const { content, version, title } = updateDocumentSchema.parse(req.body);
    const document = await store.findDocumentById(id);

    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found',
        code: 'DOC_NOT_FOUND'
      });
    }

    if (!document.collaborators.includes(req.userId)) {
      return res.status(403).json({ 
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    if (document.version !== version) {
      console.log('Version mismatch:', { current: document.version, received: version });
      return res.status(409).json({ 
        message: 'Version mismatch',
        code: 'VERSION_MISMATCH',
        currentVersion: document.version 
      });
    }

    const updates = {
      version: version + 1,
      updatedAt: new Date(),
      ...(content !== undefined && { content }),
      ...(title !== undefined && { title })
    };

    const updated = await store.updateDocument(id, updates);
    console.log('Document updated successfully:', {
      id,
      version: updated.version
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: error.errors[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    res.status(500).json({ 
      message: 'Failed to update document',
      code: 'SERVER_ERROR'
    });
  }
});

// List user's documents
router.get('/', auth, async (req, res) => {
  console.log('Listing documents for user:', req.userId);
  
  try {
    const documents = await store.findDocumentsByUserId(req.userId);
    console.log('Documents found:', documents.length);
    
    const documentsWithMeta = documents.map(doc => ({
      ...doc,
      isOwner: doc.owner === req.userId,
      collaboratorCount: doc.collaborators.length
    }));

    res.json(documentsWithMeta);
  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({ 
      message: 'Failed to fetch documents',
      code: 'SERVER_ERROR'
    });
  }
});

// Export document
router.get('/:id/export/:format', auth, async (req, res) => {
  const { id, format } = req.params;
  console.log('Exporting document:', { id, format, userId: req.userId });

  try {
    const document = await store.findDocumentById(id);

    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found',
        code: 'DOC_NOT_FOUND'
      });
    }

    if (!document.collaborators.includes(req.userId)) {
      return res.status(403).json({ 
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    switch (format.toLowerCase()) {
      case 'pdf':
        const pdf = await exportService.toPDF(document.content, document.title);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${document.title}.pdf"`);
        return res.send(pdf);

      case 'html':
        const html = await exportService.toHTML(document.content, document.title);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${document.title}.html"`);
        return res.send(html);

      case 'docx':
        const docx = await exportService.toDOCX(document.content, document.title);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${document.title}.docx"`);
        return res.send(docx);

      default:
        return res.status(400).json({ 
          message: 'Unsupported export format',
          code: 'INVALID_FORMAT'
        });
    }
  } catch (error) {
    console.error('Export failed:', error);
    return res.status(500).json({ 
      message: 'Failed to export document',
      code: 'EXPORT_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add collaborator
router.post('/:id/collaborators', auth, async (req, res) => {
  const { id } = req.params;
  console.log('Adding collaborator:', { documentId: id, userId: req.userId });

  try {
    const document = await store.findDocumentById(id);
    
    if (!document) {
      return res.status(404).json({ 
        message: 'Document not found',
        code: 'DOC_NOT_FOUND'
      });
    }

    if (document.owner !== req.userId) {
      return res.status(403).json({ 
        message: 'Only the owner can add collaborators',
        code: 'NOT_OWNER'
      });
    }

    const collaboratorEmail = z.string().email().parse(req.body.email);
    const collaborator = await store.findUserByEmail(collaboratorEmail);

    if (!collaborator) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (document.collaborators.includes(collaborator.id)) {
      return res.status(400).json({ 
        message: 'User is already a collaborator',
        code: 'ALREADY_COLLABORATOR'
      });
    }

    const updated = await store.addCollaborator(id, collaborator.id);
    console.log('Collaborator added successfully:', {
      documentId: id,
      collaborator: collaborator.email
    });

    res.json(updated);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: error.errors[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    res.status(500).json({ 
      message: 'Failed to add collaborator',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;