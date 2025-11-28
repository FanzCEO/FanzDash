import express from 'express';
import multer from 'multer';
import { enhancedMediaHub } from '../media/EnhancedMediaHub.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { createSecureUploadMiddleware } from '../middleware/fileScanningMiddleware';

const router = express.Router();

// Configure secure upload with virus scanning for media files
const upload = createSecureUploadMiddleware({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow video, image, and audio files
    const allowedTypes = [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'audio/mp3', 'audio/wav', 'audio/aac', 'audio/ogg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  }
});

// Rate limiting for media operations
const mediaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: { error: 'Too many media uploads. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
  message: { error: 'Rate limit exceeded.' },
});

// Input validation
const validateSyncRequest = [
  body('assetId').isString().notEmpty().withMessage('Asset ID is required'),
  body('targetPlatforms').isArray({ min: 1 }).withMessage('At least one target platform required'),
  body('targetPlatforms.*').isIn(['boyfanz', 'girlfanz', 'pupfanz', 'transfanz', 'taboofanz', 'fanztube', 'fanzclips']).withMessage('Invalid platform'),
  body('userId').isString().notEmpty().withMessage('User ID is required')
];

const validateModerationAction = [
  body('assetId').isString().notEmpty().withMessage('Asset ID is required'),
  body('action').isIn(['approve', 'reject', 'review']).withMessage('Invalid moderation action'),
  body('moderatorId').isString().notEmpty().withMessage('Moderator ID is required'),
  body('notes').optional().isString()
];

// Middleware
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

const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header required'
    });
  }
  // In production, validate the JWT token here
  next();
};

const requireModerator = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const moderatorKey = req.headers['x-moderator-key'];
  if (process.env.NODE_ENV === 'production' && !moderatorKey) {
    return res.status(403).json({
      success: false,
      error: 'Moderator access required'
    });
  }
  next();
};

// Media Upload and Management Routes

// Upload media asset
router.post('/upload', mediaLimiter, isAuthenticated, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No media file provided'
      });
    }

    const { platform, userId, metadata } = req.body;

    if (!platform || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: platform, userId'
      });
    }

    const parsedMetadata = metadata ? JSON.parse(metadata) : {};

    console.log('Media upload request:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      platform,
      userId,
      ip: req.ip
    });

    const assetId = await enhancedMediaHub.addMediaAsset(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      userId,
      platform,
      parsedMetadata
    );

    res.json({
      success: true,
      assetId,
      message: 'Media asset uploaded successfully',
      forensicProtection: {
        contentHash: 'generated',
        digitalWatermark: 'embedded',
        blockchainTimestamp: 'created'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Media upload failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get media asset details
router.get('/asset/:assetId', generalLimiter, isAuthenticated, async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await enhancedMediaHub.getAsset(assetId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Media asset not found',
        timestamp: new Date().toISOString()
      });
    }

    // Remove sensitive forensic data from public response
    const publicAsset = {
      ...asset,
      forensicData: {
        verificationStatus: asset.forensicData.verificationStatus,
        timestampProof: asset.forensicData.timestampProof,
        // Hide sensitive forensic details
        contentHash: asset.forensicData.contentHash.slice(0, 16) + '...'
      }
    };

    res.json({
      success: true,
      asset: publicAsset,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching media asset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch media asset',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user's media assets
router.get('/user/:userId/assets', generalLimiter, isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, platform } = req.query;

    let assets = await enhancedMediaHub.getAssetsByUser(userId);

    // Filter by platform if specified
    if (platform) {
      assets = assets.filter(asset => asset.metadata.platform === platform);
    }

    // Pagination
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedAssets = assets.slice(startIndex, endIndex);

    // Remove sensitive data
    const publicAssets = paginatedAssets.map(asset => ({
      ...asset,
      forensicData: {
        verificationStatus: asset.forensicData.verificationStatus,
        timestampProof: asset.forensicData.timestampProof
      }
    }));

    res.json({
      success: true,
      assets: publicAssets,
      pagination: {
        total: assets.length,
        limit: parseInt(limit as string),
        offset: startIndex,
        hasMore: endIndex < assets.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user assets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user assets',
      timestamp: new Date().toISOString()
    });
  }
});

// Cross-Platform Synchronization Routes

// Sync media to multiple platforms
router.post('/sync', generalLimiter, isAuthenticated, validateSyncRequest, checkValidation, async (req, res) => {
  try {
    const { assetId, targetPlatforms, userId } = req.body;

    console.log('Cross-platform sync request:', {
      assetId,
      targetPlatforms,
      userId,
      ip: req.ip,
      timestamp: new Date()
    });

    const syncJobId = await enhancedMediaHub.syncToPlatforms(assetId, targetPlatforms, userId);

    res.json({
      success: true,
      syncJobId,
      targetPlatforms,
      message: 'Cross-platform synchronization started',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync request error:', error);
    res.status(500).json({
      success: false,
      error: 'Sync request failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get sync job status
router.get('/sync/:syncJobId/status', generalLimiter, isAuthenticated, async (req, res) => {
  try {
    const { syncJobId } = req.params;
    const syncJob = await enhancedMediaHub.getSyncJobStatus(syncJobId);

    if (!syncJob) {
      return res.status(404).json({
        success: false,
        error: 'Sync job not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      syncJob,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching sync status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync status',
      timestamp: new Date().toISOString()
    });
  }
});

// Content Moderation Routes

// Get moderation result for asset
router.get('/moderation/:assetId', generalLimiter, requireModerator, async (req, res) => {
  try {
    const { assetId } = req.params;
    const moderationResult = await enhancedMediaHub.getModerationResult(assetId);

    if (!moderationResult) {
      return res.status(404).json({
        success: false,
        error: 'Moderation result not found',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      moderation: moderationResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching moderation result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation result',
      timestamp: new Date().toISOString()
    });
  }
});

// Moderate asset (approve/reject)
router.post('/moderation/action', generalLimiter, requireModerator, validateModerationAction, checkValidation, async (req, res) => {
  try {
    const { assetId, action, moderatorId, notes } = req.body;

    console.log('Moderation action:', {
      assetId,
      action,
      moderatorId,
      notes: notes || 'none',
      ip: req.ip,
      timestamp: new Date()
    });

    let result = false;
    
    if (action === 'approve') {
      result = await enhancedMediaHub.approveAsset(assetId, moderatorId);
    }
    // Add reject and review actions as needed

    if (result) {
      res.json({
        success: true,
        action,
        assetId,
        message: `Asset ${action}ed successfully`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: `Failed to ${action} asset`,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Moderation action error:', error);
    res.status(500).json({
      success: false,
      error: 'Moderation action failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Analytics and Statistics Routes

// Get MediaHub statistics
router.get('/stats', generalLimiter, isAuthenticated, async (req, res) => {
  try {
    const stats = await enhancedMediaHub.getMediaHubStats();

    res.json({
      success: true,
      statistics: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching MediaHub stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Platform status and connectivity
router.get('/platforms/status', generalLimiter, isAuthenticated, async (req, res) => {
  try {
    // Mock platform status - in production, check actual connectivity
    const platformStatus = {
      boyfanz: { online: true, lastSync: new Date(), uploadQueue: 2 },
      girlfanz: { online: true, lastSync: new Date(), uploadQueue: 1 },
      pupfanz: { online: true, lastSync: new Date(), uploadQueue: 0 },
      transfanz: { online: true, lastSync: new Date(), uploadQueue: 3 },
      taboofanz: { online: true, lastSync: new Date(), uploadQueue: 1 },
      fanztube: { online: true, lastSync: new Date(), uploadQueue: 5 },
      fanzclips: { online: true, lastSync: new Date(), uploadQueue: 2 }
    };

    res.json({
      success: true,
      platforms: platformStatus,
      totalPlatforms: Object.keys(platformStatus).length,
      onlinePlatforms: Object.values(platformStatus).filter(p => p.online).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching platform status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform status',
      timestamp: new Date().toISOString()
    });
  }
});

// Forensic Protection and Security Routes

// Get forensic data for asset (admin only)
router.get('/forensics/:assetId', generalLimiter, requireModerator, async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await enhancedMediaHub.getAsset(assetId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: 'Asset not found',
        timestamp: new Date().toISOString()
      });
    }

    // Return full forensic data for authorized users
    res.json({
      success: true,
      assetId,
      forensicData: asset.forensicData,
      originalHash: asset.originalHash,
      forensicFingerprint: asset.forensicFingerprint,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching forensic data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forensic data',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Enhanced MediaHub',
    status: 'operational',
    version: '1.0.0',
    features: [
      'Cross-platform synchronization',
      'Forensic protection',
      'AI content moderation',
      'Digital watermarking',
      'Blockchain timestamping',
      'DMCA protection',
      'Multi-platform analytics',
      'Compliance integration'
    ],
    forensicProtection: [
      'SHA-256 content hashing',
      'Digital fingerprinting',
      'Invisible watermarking',
      'Blockchain timestamping',
      'IPFS storage support',
      'Copyright monitoring'
    ],
    supportedPlatforms: [
      'BoyFanz', 'GirlFanz', 'PupFanz', 'TransFanz', 
      'TabooFanz', 'FanzTube', 'FanzClips'
    ],
    timestamp: new Date().toISOString()
  });
});

// Development testing endpoint
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/test-upload', upload.single('media'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      console.log('Test upload:', {
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      });

      // Create a small test buffer
      const testBuffer = Buffer.from('test media content for development');
      
      const assetId = await enhancedMediaHub.addMediaAsset(
        testBuffer,
        req.file.originalname || 'test-file.mp4',
        req.file.mimetype || 'video/mp4',
        'dev-user',
        'boyfanz',
        { duration: 120, resolution: { width: 1920, height: 1080 } }
      );

      res.json({
        success: true,
        message: 'Test upload successful',
        assetId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        error: 'Test upload failed',
        message: error.message
      });
    }
  });
}

export default router;