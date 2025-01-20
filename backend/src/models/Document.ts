import mongoose from 'mongoose';
import { IUser } from './User';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  version: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export interface IDocument extends mongoose.Document {
  title: string;
  content: string;
  version: number;
  owner: IUser['_id'];
  collaborators: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

// Document version history schema
const documentVersionSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  patch: {
    type: [{
      type: {
        type: String,
        enum: ['insert', 'delete', 'retain'],
        required: true
      },
      chars: String,
      count: Number
    }],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export interface IDocumentVersion extends mongoose.Document {
  documentId: IDocument['_id'];
  version: number;
  patch: Array<{
    type: 'insert' | 'delete' | 'retain';
    chars?: string;
    count?: number;
  }>;
  author: IUser['_id'];
  timestamp: Date;
}

export const Document = mongoose.model<IDocument>('Document', documentSchema);
export const DocumentVersion = mongoose.model<IDocumentVersion>('DocumentVersion', documentVersionSchema);