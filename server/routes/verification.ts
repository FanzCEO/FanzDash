import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '../db';
import { eq, desc, and, or } from 'drizzle-orm';
import { isAuthenticated, requireSuperAdmin, requireModerator } from '../middleware/auth';
import logger from '../utils/logger';
import { verificationService } from '../services/verificationService';

const router = express.Router();

// Rate limiting for verification endpoints
const verificationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit verification submissions
  message: {
    error: 'Too many verification requests from this IP, please try again later'
  }
});

// Validation middleware
const handleValidationErrors = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * GET /api/costar-verification/stats
 * Get co-star verification statistics
 */
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const stats = await verificationService.getCostarStats();
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching verification stats:', error);
    res.status(500).json({ error: 'Failed to fetch verification statistics' });
  }
});

/**
 * GET /api/costar-verification
 * List all co-star verification submissions
 */
router.get('/', isAuthenticated, requireModerator, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const filters = {
      status: status as string,
      limit: Number(limit),
      offset: Number(offset),
    };

    const result = await verificationService.listCostarVerifications(filters);

    res.json({
      verifications: result.verifications,
      total: result.total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    logger.error('Error fetching verifications:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

/**
 * POST /api/costar-verification
 * Submit new co-star verification form
 */
router.post('/',
  verificationRateLimit,
  isAuthenticated,
  [
    body('legalName').isString().notEmpty().withMessage('Legal name is required'),
    body('dateOfBirth').isString().notEmpty().withMessage('Date of birth is required'),
    body('age').isInt({ min: 18 }).withMessage('Must be 18 or older'),
    body('identificationType').isIn(['drivers_license', 'passport', 'non_dl_id', 'other']).withMessage('Valid ID type required'),
    body('identificationNumber').isString().notEmpty().withMessage('ID number is required'),
    body('address').isString().notEmpty().withMessage('Address is required'),
    body('city').isString().notEmpty().withMessage('City is required'),
    body('state').isString().notEmpty().withMessage('State is required'),
    body('zipCode').isString().notEmpty().withMessage('ZIP code is required'),
    body('cellPhone').isString().notEmpty().withMessage('Cell phone is required'),
    body('primaryCreatorLegalName').isString().notEmpty().withMessage('Primary creator name is required'),
    body('contentCreationDate').isString().notEmpty().withMessage('Content creation date is required'),
    body('certifyAge18').isBoolean().equals(true).withMessage('Must certify age 18+'),
    body('certifyAllNames').isBoolean().equals(true).withMessage('Must certify all names disclosed'),
    body('certifyValidId').isBoolean().equals(true).withMessage('Must certify valid ID'),
    body('certifyNoIllegalActs').isBoolean().equals(true).withMessage('Must certify no illegal acts'),
    body('certifyFreelyEntering').isBoolean().equals(true).withMessage('Must certify entering freely'),
    body('coStarSignatureDate').isString().notEmpty().withMessage('Co-star signature date required'),
    body('coStarInitials').isString().notEmpty().withMessage('Co-star initials required'),
    body('primaryCreatorSignatureDate').isString().notEmpty().withMessage('Primary creator signature date required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const verificationData = {
        id: `costar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...req.body,
        submittedBy: req.user?.id,
        platform: req.user?.platform || 'fanzdash',
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      const verification = await verificationService.createCostarVerification(verificationData);

      res.status(201).json({
        message: 'Co-Star verification form submitted successfully',
        verificationId: verification.id,
        status: 'pending',
      });
    } catch (error) {
      logger.error('Error submitting co-star verification:', error);
      res.status(500).json({ error: 'Failed to submit verification form' });
    }
  }
);

/**
 * GET /api/costar-verification/:id
 * Get specific co-star verification details
 */
router.get('/:id',
  isAuthenticated,
  requireModerator,
  param('id').isString().notEmpty(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const verification = await verificationService.getCostarVerification(id);

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      res.json(verification);
    } catch (error) {
      logger.error('Error fetching verification details:', error);
      res.status(500).json({ error: 'Failed to fetch verification details' });
    }
  }
);

/**
 * PATCH /api/costar-verification/:id/approve
 * Approve co-star verification
 */
router.patch('/:id/approve',
  isAuthenticated,
  requireSuperAdmin,
  param('id').isString().notEmpty(),
  [
    body('notes').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const verification = await verificationService.approveCostarVerification(
        id,
        req.user?.id || 'unknown',
        notes
      );

      res.json({
        message: 'Co-Star verification approved successfully',
        verification,
      });
    } catch (error) {
      logger.error('Error approving verification:', error);
      res.status(500).json({ error: 'Failed to approve verification' });
    }
  }
);

/**
 * PATCH /api/costar-verification/:id/reject
 * Reject co-star verification
 */
router.patch('/:id/reject',
  isAuthenticated,
  requireSuperAdmin,
  param('id').isString().notEmpty(),
  [
    body('reason').isString().notEmpty().withMessage('Rejection reason is required'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // In production, update in database
      const verification = coStarVerifications.find(v => v.id === id);

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      verification.status = 'rejected';
      verification.rejectedAt = new Date().toISOString();
      verification.rejectedBy = req.user?.id;
      verification.rejectionReason = reason;

      verificationStats.pendingReviews--;
      verificationStats.rejectedToday++;

      // Log audit trail
      logger.info('Co-Star verification rejected', {
        verificationId: id,
        rejectedBy: req.user?.id,
        reason,
        legalName: verification.legalName,
      });

      res.json({
        message: 'Co-Star verification rejected',
        verification,
      });
    } catch (error) {
      logger.error('Error rejecting verification:', error);
      res.status(500).json({ error: 'Failed to reject verification' });
    }
  }
);

/**
 * GET /api/costar-verification/:id/download-pdf
 * Download co-star verification form as PDF
 */
router.get('/:id/download-pdf',
  isAuthenticated,
  requireSuperAdmin,
  param('id').isString().notEmpty(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // In production, generate PDF from verification data
      const verification = coStarVerifications.find(v => v.id === id);

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      // TODO: Implement PDF generation
      // For now, return JSON
      res.json({
        message: 'PDF generation not yet implemented',
        verification,
      });
    } catch (error) {
      logger.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  }
);

export default router;
