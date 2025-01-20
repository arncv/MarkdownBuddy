import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { store } from '../utils/store.js';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware: Processing request');
    const header = req.header('Authorization');
    console.log('Auth header:', header);

    if (!header) {
      console.log('No authorization header found');
      throw new Error('No authorization header');
    }

    const token = header.replace('Bearer ', '');
    console.log('Extracted token:', token);

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { userId: string };
    
    console.log('Decoded token:', decoded);

    const user = await store.findUserById(decoded.userId);
    console.log('Found user:', user);

    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      throw new Error('User not found');
    }

    req.userId = user.id;
    console.log('Request authorized for user:', req.userId);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};