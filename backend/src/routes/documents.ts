import express from 'express';
import { auth } from '../middleware/auth.js';
import { z } from 'zod';
import { store } from '../utils/store.js';
import { ExportService } from '../services/exportService.js';

const router = express.Router();
const exportService = new ExportService();

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
    const document = await store.createDocument({
      title,
      content: '',
      owner: req.userId,
      collaborators: [req.userId],
      version: 0
    });
    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to create document' });
  }
});

// Get document by id
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await store.findDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (!document.collaborators.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// Update document
router.patch('/:id', auth, async (req, res) => {
  try {
    const { content, version, title } = updateDocumentSchema.parse(req.body);
    const document = await store.findDocumentById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.collaborators.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (document.version !== version) {
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
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// List user's documents
router.get('/', auth, async (req, res) => {
  try {
    const documents = await store.findDocumentsByUserId(req.userId);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Export document
router.get('/:id/export/:format', auth, async (req, res) => {
  try {
    const { id, format } = req.params;
    const document = await store.findDocumentById(id);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.collaborators.includes(req.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let content: Buffer | string;
    let contentType: string;
    let fileExtension: string;

    switch (format.toLowerCase()) {
      case 'pdf':
        content = await exportService.toPDF(document.content, document.title);
        contentType = 'application/pdf';
        fileExtension = 'pdf';
        break;

      case 'html':
        content = await exportService.toHTML(document.content, document.title);
        contentType = 'text/html';
        fileExtension = 'html';
        break;

      case 'docx':
        content = await exportService.toDOCX(document.content, document.title);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileExtension = 'docx';
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format' });
    }

    // Sanitize filename
    const sanitizedTitle = document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedTitle}.${fileExtension}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    console.error('Export failed:', error);
    res.status(500).json({ message: 'Failed to export document' });
  }
});

// Add collaborator
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const document = await store.findDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.owner !== req.userId) {
      return res.status(403).json({ message: 'Only owner can add collaborators' });
    }

    const collaboratorEmail = z.string().email().parse(req.body.email);
    const collaborator = await store.findUserByEmail(collaboratorEmail);

    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (document.collaborators.includes(collaborator.id)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    const updated = await store.addCollaborator(req.params.id, collaborator.id);
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to add collaborator' });
  }
});

export default router;