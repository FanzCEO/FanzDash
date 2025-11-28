/**
 * Authentication Middleware for FanzDash
 *
 * Supports:
 * - JWT tokens
 * - Supabase Auth
 * - Session-based auth
 * - API key auth (for server-to-server)
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { authLogger } from '../utils/logger';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
        clearanceLevel?: number;
        claims?: any;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client (optional, for Supabase auth)
let supabase: ReturnType<typeof createClient> | null = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Extract token from request headers
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  // Support both "Bearer token" and "token" formats
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Verify JWT token
 */
async function verifyJWT(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    authLogger.warn('JWT verification failed', { error: (error as Error).message });
    return null;
  }
}

/**
 * Verify Supabase token
 */
async function verifySupabaseToken(token: string): Promise<any> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      authLogger.warn('Supabase auth failed', { error: error?.message });
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'user',
      claims: data.user.user_metadata
    };
  } catch (error) {
    authLogger.error('Supabase verification error', error as Error);
    return null;
  }
}

/**
 * Main authentication middleware
 * Verifies user is authenticated
 */
export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      authLogger.warn('No token provided', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Try Supabase auth first if configured
    if (supabase) {
      const user = await verifySupabaseToken(token);
      if (user) {
        req.user = user;
        authLogger.auth('token-verify', user.id, true, { method: 'supabase' });
        next();
        return;
      }
    }

    // Fall back to JWT verification
    const decoded = await verifyJWT(token);
    if (!decoded) {
      authLogger.warn('Token verification failed', {
        path: req.path,
        ip: req.ip
      });
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Set user on request
    req.user = {
      id: decoded.sub || decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
      clearanceLevel: decoded.clearanceLevel || 1,
      claims: decoded
    };

    authLogger.auth('token-verify', req.user.id, true, { method: 'jwt' });
    next();
  } catch (error) {
    authLogger.error('Authentication error', error as Error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

/**
 * Role-based authorization middleware
 * Requires user to have specific role(s)
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      authLogger.warn('Role check failed - no user', { path: req.path });
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRole = req.user.role || 'user';

    if (!allowedRoles.includes(userRole)) {
      authLogger.warn('Role check failed', {
        userId: req.user.id,
        userRole,
        allowedRoles,
        path: req.path
      });
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    authLogger.auth('role-check', req.user.id, true, { role: userRole });
    next();
  };
}

/**
 * Clearance level authorization
 * Requires user to have minimum clearance level
 */
/**
 * CRITICAL SECURITY: Super Admin Only Access
 *
 * REQUIRED for all endpoints handling:
 * - CSAM evidence and legal hold data
 * - Law enforcement collaboration data
 * - Highly sensitive compliance materials
 *
 * Only users with role="super_admin" can access these endpoints.
 * All access attempts are logged for audit trail compliance.
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    authLogger.warn('Super Admin check failed - no user', {
      path: req.path,
      ip: req.ip,
      attempt: 'UNAUTHORIZED_ACCESS'
    });
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const userRole = req.user.role || 'user';

  if (userRole !== 'super_admin') {
    authLogger.critical('Super Admin access denied', {
      userId: req.user.id,
      userRole,
      path: req.path,
      ip: req.ip,
      timestamp: new Date().toISOString(),
      severity: 'CRITICAL'
    });
    res.status(403).json({ error: 'Super Admin access required - This incident has been logged' });
    return;
  }

  authLogger.auth('super-admin-access', req.user.id, true, {
    path: req.path,
    timestamp: new Date().toISOString()
  });
  next();
}

export function requireClearance(minLevel: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      authLogger.warn('Clearance check failed - no user', { path: req.path });
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userLevel = req.user.clearanceLevel || 1;

    if (userLevel < minLevel) {
      authLogger.warn('Clearance check failed', {
        userId: req.user.id,
        userLevel,
        requiredLevel: minLevel,
        path: req.path
      });
      res.status(403).json({ error: 'Insufficient clearance level' });
      return;
    }

    authLogger.auth('clearance-check', req.user.id, true, { level: userLevel });
    next();
  };
}

/**
 * Optional authentication
 * Authenticates if token present, but doesn't require it
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    // Try Supabase first
    if (supabase) {
      const user = await verifySupabaseToken(token);
      if (user) {
        req.user = user;
        next();
        return;
      }
    }

    // Try JWT
    const decoded = await verifyJWT(token);
    if (decoded) {
      req.user = {
        id: decoded.sub || decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
        clearanceLevel: decoded.clearanceLevel || 1,
        claims: decoded
      };
    }
  } catch (error) {
    authLogger.debug('Optional auth failed', { error: (error as Error).message });
  }

  next();
}

/**
 * API Key authentication (for server-to-server)
 */
export function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    authLogger.warn('API key missing', { path: req.path, ip: req.ip });
    res.status(401).json({ error: 'API key required' });
    return;
  }

  // In production, validate against database
  // For now, check against environment variable
  const validApiKey = process.env.API_KEY;

  if (apiKey !== validApiKey) {
    authLogger.warn('Invalid API key', { path: req.path, ip: req.ip });
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  authLogger.auth('api-key', 'system', true);
  next();
}

/**
 * Creator-only middleware
 * Requires user to be a verified creator
 */
export function requireCreator(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Check if user is a creator (this should be in the token claims)
  const isCreator = req.user.claims?.is_creator || req.user.claims?.isCreator;

  if (!isCreator) {
    authLogger.warn('Creator access denied', {
      userId: req.user.id,
      path: req.path
    });
    res.status(403).json({ error: 'Creator account required' });
    return;
  }

  next();
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin', 'super_admin', 'executive');

/**
 * Moderator or higher middleware
 */
export const requireModerator = requireRole('moderator', 'admin', 'super_admin', 'executive');

/**
 * Generate JWT token for user
 */
export function generateToken(user: {
  id: string;
  email?: string;
  role?: string;
  clearanceLevel?: number;
  [key: string]: any;
}): string {
  const payload = {
    sub: user.id,
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
    clearanceLevel: user.clearanceLevel || 1,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  };

  return jwt.sign(payload, JWT_SECRET);
}

// Export types for use in other files
export type AuthenticatedRequest = Request & {
  user: NonNullable<Request['user']>;
};
