import express from 'express';
import { body, validationResult } from 'express-validator';
import { isAuthenticated, requireAdmin } from '../middleware/auth';
import argon2 from 'argon2';

const router = express.Router();

// Mock user storage (replace with database in production)
const users: any[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@fanzdash.com',
    role: 'admin',
    status: 'active',
    lastActive: new Date().toISOString(),
    moderationCount: 245,
    accuracy: 98.5,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    username: 'moderator1',
    email: 'mod1@fanzdash.com',
    role: 'moderator',
    status: 'active',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    moderationCount: 187,
    accuracy: 96.2,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    username: 'analyst1',
    email: 'analyst@fanzdash.com',
    role: 'analyst',
    status: 'active',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    moderationCount: 56,
    accuracy: 94.1,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    username: 'viewer1',
    email: 'viewer@fanzdash.com',
    role: 'viewer',
    status: 'active',
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    moderationCount: 0,
    accuracy: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Validation middleware
const handleValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

/**
 * GET /api/users
 * Get all users
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Remove password hashes from response
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * POST /api/users
 * Create a new user (Admin only)
 */
router.post(
  '/',
  isAuthenticated,
  requireAdmin,
  [
    body('username').notEmpty().trim().isLength({ min: 3, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').isIn(['admin', 'moderator', 'analyst', 'viewer']),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      // Check if username or email already exists
      if (users.some(u => u.username === username)) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      if (users.some(u => u.email === email)) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await argon2.hash(password);

      const newUser = {
        id: `user_${Date.now()}`,
        username,
        email,
        password: hashedPassword,
        role,
        status: 'active',
        lastActive: new Date().toISOString(),
        moderationCount: 0,
        accuracy: 0,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);

      // Return user without password
      const { password: _, ...safeUser } = newUser;
      res.status(201).json({ message: 'User created successfully', user: safeUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

/**
 * PATCH /api/users/:id
 * Update a user (Admin only)
 */
router.patch(
  '/:id',
  isAuthenticated,
  requireAdmin,
  [
    body('username').optional().trim().isLength({ min: 3, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['admin', 'moderator', 'analyst', 'viewer']),
    body('status').optional().isIn(['active', 'inactive', 'suspended']),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check for duplicate username/email if being updated
      if (updates.username && users.some(u => u.username === updates.username && u.id !== id)) {
        return res.status(409).json({ error: 'Username already exists' });
      }
      if (updates.email && users.some(u => u.email === updates.email && u.id !== id)) {
        return res.status(409).json({ error: 'Email already exists' });
      }

      // Update user
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const { password: _, ...safeUser } = users[userIndex];
      res.json({ message: 'User updated successfully', user: safeUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

/**
 * DELETE /api/users/:id
 * Delete a user (Admin only)
 */
router.delete('/:id', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting the last admin
    const deletingUser = users[userIndex];
    if (deletingUser.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    const { password: _, ...safeUser } = deletedUser;

    res.json({ message: 'User deleted successfully', user: safeUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/users/:id
 * Get a specific user
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
