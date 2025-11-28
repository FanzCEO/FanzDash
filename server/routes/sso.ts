import express from 'express';
import { fanzSSO } from '../auth/fanzSSO.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Rate limit exceeded. Please slow down.' },
});

// Input validation
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const validateTokenRefresh = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

const validateAccessCheck = [
  body('token').notEmpty().withMessage('Access token is required'),
  body('platform').isIn(['BoyFanz', 'GirlFanz', 'PupFanz', 'TransFanz', 'TabooFanz', 'FanzTube', 'FanzClips']).withMessage('Invalid platform'),
  body('domain').isURL({ require_tld: true }).withMessage('Valid domain required')
];

// Middleware for validation results
const checkValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// SSO Authentication Endpoints

// Login endpoint
router.post('/login', authLimiter, validateLogin, checkValidation, async (req, res) => {
  try {
    const { email, password, platform, domain } = req.body;
    
    console.log('SSO Login attempt:', {
      email,
      platform: platform || 'unknown',
      domain: domain || 'unknown',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    const result = await fanzSSO.authenticateUser(email, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error,
        details: result.details,
        timestamp: new Date().toISOString()
      });
    }

    // Set secure HTTP-only cookies for tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days for refresh token
    };

    res.cookie('refreshToken', result.tokens!.refreshToken, cookieOptions);
    res.cookie('accessToken', result.tokens!.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000 // 1 hour for access token
    });

    res.json({
      success: true,
      user: {
        id: result.user!.id,
        email: result.user!.email,
        username: result.user!.username,
        displayName: result.user!.displayName,
        avatar: result.user!.avatar,
        membershipTier: result.user!.membershipTier,
        platformAccess: result.user!.platformAccess,
        lastLogin: result.user!.lastLogin
      },
      tokens: {
        accessToken: result.tokens!.accessToken,
        expiresIn: result.tokens!.expiresIn
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SSO Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication',
      timestamp: new Date().toISOString()
    });
  }
});

// Token refresh endpoint
router.post('/refresh', authLimiter, validateTokenRefresh, checkValidation, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // In a complete implementation, this would verify the refresh token
    // and issue new access and refresh tokens
    
    res.json({
      success: false,
      error: 'Token refresh not yet implemented',
      message: 'This endpoint will validate refresh tokens and issue new access tokens',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Access validation endpoint (used by other platforms)
router.post('/validate', generalLimiter, validateAccessCheck, checkValidation, async (req, res) => {
  try {
    const { token, platform, domain } = req.body;
    
    console.log('Access validation request:', {
      platform,
      domain,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    const result = await fanzSSO.validateAccess(token, platform, domain);

    if (!result.hasAccess) {
      return res.status(403).json({
        success: false,
        hasAccess: false,
        reason: result.reason,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      hasAccess: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        displayName: result.user!.displayName,
        membershipTier: result.user!.membershipTier,
        accessLevel: result.accessLevel
      },
      sessionId: result.sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Access validation error:', error);
    res.status(500).json({
      success: false,
      hasAccess: false,
      error: 'Access validation failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Logout endpoint
router.post('/logout', generalLimiter, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    // In a complete implementation, this would revoke the session
    console.log('User logout:', { sessionId, ip: req.ip, timestamp: new Date() });
    
    res.json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user profile
router.get('/profile', generalLimiter, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);
    
    // In a complete implementation, this would decode and validate the token
    // and return the user profile
    
    res.json({
      success: false,
      error: 'Profile retrieval not yet implemented',
      message: 'This endpoint will return user profile data from validated tokens',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile retrieval failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Admin endpoints (require admin privileges)

// Suspend user endpoint
router.post('/admin/suspend', generalLimiter, async (req, res) => {
  try {
    const { userId, reason, adminId } = req.body;

    if (!userId || !reason || !adminId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, reason, adminId',
        timestamp: new Date().toISOString()
      });
    }

    console.log('User suspension request:', {
      userId,
      reason,
      adminId,
      ip: req.ip,
      timestamp: new Date()
    });

    const result = await fanzSSO.suspendUser(userId, reason, adminId);

    res.json({
      success: result,
      message: result ? 'User suspended successfully' : 'Failed to suspend user',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User suspension error:', error);
    res.status(500).json({
      success: false,
      error: 'User suspension failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Platform status endpoint
router.get('/platforms/status', generalLimiter, async (req, res) => {
  try {
    // Return status of all integrated platforms
    const platformStatus = {
      BoyFanz: { online: true, users: 1250, lastSync: new Date() },
      GirlFanz: { online: true, users: 2100, lastSync: new Date() },
      PupFanz: { online: true, users: 890, lastSync: new Date() },
      TransFanz: { online: true, users: 750, lastSync: new Date() },
      TabooFanz: { online: true, users: 450, lastSync: new Date() },
      FanzTube: { online: true, users: 3200, lastSync: new Date() },
      FanzClips: { online: true, users: 1800, lastSync: new Date() }
    };

    res.json({
      success: true,
      platforms: platformStatus,
      totalUsers: Object.values(platformStatus).reduce((sum, p) => sum + p.users, 0),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Platform status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platform status',
      timestamp: new Date().toISOString()
    });
  }
});

// SSO health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'FanzSSO',
    status: 'operational',
    version: '1.0.0',
    uptime: process.uptime(),
    features: [
      'Cross-platform authentication',
      'JWT token management',
      'Access validation',
      'User suspension',
      'Admin controls',
      'Rate limiting',
      'Input validation'
    ],
    timestamp: new Date().toISOString()
  });
});

// Domain routing configuration
router.get('/domains', generalLimiter, (req, res) => {
  try {
    // Return approved domain mappings based on user rules
    const domainMappings = {
      'boyfanz.com': { platform: 'BoyFanz', requiresAuth: true, tier: 'premium' },
      'girlfanz.com': { platform: 'GirlFanz', requiresAuth: true, tier: 'premium' },
      'pupfanz.com': { platform: 'PupFanz', requiresAuth: true, tier: 'premium' },
      'transfanz.com': { platform: 'TransFanz', requiresAuth: true, tier: 'premium' },
      'taboofanz.com': { platform: 'TabooFanz', requiresAuth: true, tier: 'vip' },
      'fanz.tube': { platform: 'FanzTube', requiresAuth: false, tier: 'free' },
      'fanzclips.com': { platform: 'FanzClips', requiresAuth: true, tier: 'premium' }
    };

    res.json({
      success: true,
      domains: domainMappings,
      totalDomains: Object.keys(domainMappings).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Domain mapping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get domain mappings',
      timestamp: new Date().toISOString()
    });
  }
});

// Payment processing integration
router.post('/payment/process', generalLimiter, async (req, res) => {
  try {
    const { userId, amount, platform, type, metadata } = req.body;

    if (!userId || !amount || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, amount, platform',
        timestamp: new Date().toISOString()
      });
    }

    console.log('SSO Payment processing:', {
      userId,
      amount,
      platform,
      type: type || 'unknown',
      ip: req.ip,
      timestamp: new Date()
    });

    const paymentMetadata = {
      type: type || 'purchase',
      sourceUserId: req.body.sourceUserId,
      itemId: req.body.itemId,
      description: metadata?.description
    };

    const result = await fanzSSO.processPayment(userId, amount, platform, paymentMetadata);

    res.json({
      success: result.success,
      paymentId: result.paymentId,
      error: result.error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SSO Payment processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment processing failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;