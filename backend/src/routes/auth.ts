import express from 'express';
import { store } from '../utils/store.js';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    const user = await store.findUserByEmail(email);

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // For development, accept 'password123' as the password
    if (password !== 'password123') {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', { userId: user.id });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      code: 'SERVER_ERROR'
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('Fetching user data:', req.userId);
    const user = await store.findUserById(req.userId);
    
    if (!user) {
      console.log('User not found:', req.userId);
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    console.log('User data fetched successfully:', { userId: user.id });
    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user data',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;
