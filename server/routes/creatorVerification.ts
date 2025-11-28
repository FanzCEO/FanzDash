import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, query, param, validationResult } from 'express-validator';
import { db } from '../db';
import { eq, desc, and, or } from 'drizzle-orm';
import { isAuthenticated, requireSuperAdmin, requireModerator, requireCreator } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

// Rate limiting for creator verification endpoints
const creatorVerificationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit creator verification submissions to 5 per hour
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

// Mock database for now - replace with actual schema
const creatorVerifications: any[] = [];
const creatorVerificationStats = {
  pendingReviews: 0,
  approvedToday: 0,
  rejectedToday: 0,
  totalVerified: 0,
  totalCreators: 0,
};

/**
 * GET /api/creator-verification/stats
 * Get creator verification statistics
 */
router.get('/stats', isAuthenticated, requireModerator, async (req, res) => {
  try {
    res.json(creatorVerificationStats);
  } catch (error) {
    logger.error('Error fetching creator verification stats:', error);
    res.status(500).json({ error: 'Failed to fetch verification statistics' });
  }
});

/**
 * GET /api/creator-verification
 * List all creator verification submissions
 */
router.get('/', isAuthenticated, requireModerator, async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let filtered = [...creatorVerifications];

    if (status && status !== 'all') {
      filtered = filtered.filter(v => v.status === status);
    }

    if (search) {
      const searchLower = String(search).toLowerCase();
      filtered = filtered.filter(v =>
        v.fullLegalName.toLowerCase().includes(searchLower) ||
        v.stageName?.toLowerCase().includes(searchLower) ||
        v.emailAddress.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    const results = filtered.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      verifications: results,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    logger.error('Error fetching creator verifications:', error);
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
});

/**
 * POST /api/creator-verification
 * Submit new creator verification form
 */
router.post('/',
  creatorVerificationRateLimit,
  isAuthenticated,
  [
    body('fullLegalName').isString().notEmpty().withMessage('Full legal name is required'),
    body('dateOfBirth').isString().notEmpty().withMessage('Date of birth is required'),
    body('age').isInt({ min: 18 }).withMessage('Must be 18 or older'),
    body('countryOfCitizenship').isString().notEmpty().withMessage('Country is required'),
    body('residentialAddress').isString().notEmpty().withMessage('Address is required'),
    body('city').isString().notEmpty().withMessage('City is required'),
    body('stateProvince').isString().notEmpty().withMessage('State/Province is required'),
    body('zipPostalCode').isString().notEmpty().withMessage('ZIP code is required'),
    body('mobilePhone').isString().notEmpty().withMessage('Mobile phone is required'),
    body('emailAddress').isEmail().withMessage('Valid email is required'),
    body('identificationType').isArray({ min: 1 }).withMessage('At least one ID type required'),

    // Digital verification checks
    body('photoIdUploaded').isBoolean().equals(true).withMessage('Photo ID upload required'),
    body('selfieVerified').isBoolean().equals(true).withMessage('Selfie verification required'),
    body('ageMetadataValidated').isBoolean().equals(true).withMessage('Age validation required'),
    body('signatureCaptured').isBoolean().equals(true).withMessage('Signature required'),
    body('twoFactorSetup').isBoolean().equals(true).withMessage('2FA setup required'),

    // Creator certifications
    body('certifyIndependentCreator').isBoolean().equals(true).withMessage('Must certify independent creator'),
    body('certifyRetainOwnership').isBoolean().equals(true).withMessage('Must certify content ownership'),
    body('certify2257Compliance').isBoolean().equals(true).withMessage('Must certify 2257 compliance'),
    body('certifyAllPerformers18').isBoolean().equals(true).withMessage('Must certify all performers 18+'),
    body('certifyDistributionRights').isBoolean().equals(true).withMessage('Must certify distribution rights'),

    // Policy acknowledgments
    body('acknowledgeProhibitedContent').isBoolean().equals(true).withMessage('Must acknowledge prohibited content'),
    body('acknowledgeProhibitedConduct').isBoolean().equals(true).withMessage('Must acknowledge prohibited conduct'),
    body('acknowledgeZeroTolerance').isBoolean().equals(true).withMessage('Must acknowledge zero tolerance'),

    // Legal agreements
    body('acknowledgeContentOwnership').isBoolean().equals(true).withMessage('Must acknowledge content ownership'),
    body('acknowledgeDataPrivacy').isBoolean().equals(true).withMessage('Must acknowledge data privacy'),
    body('acceptArbitration').isBoolean().equals(true).withMessage('Must accept arbitration'),
    body('acceptIndemnification').isBoolean().equals(true).withMessage('Must accept indemnification'),

    // Sworn declarations
    body('swornDeclarationAllIdsValid').isBoolean().equals(true).withMessage('Must swear IDs valid'),
    body('swornDeclarationAllPerformersVerified').isBoolean().equals(true).withMessage('Must swear performers verified'),
    body('swornDeclarationMaintain2257').isBoolean().equals(true).withMessage('Must swear to maintain 2257 records'),
    body('swornDeclarationFreelyEntering').isBoolean().equals(true).withMessage('Must swear entering freely'),

    body('signatureDate').isString().notEmpty().withMessage('Signature date required'),
    body('electronicSignatureAcknowledged').isBoolean().equals(true).withMessage('Must acknowledge e-signature'),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const verificationData = {
        id: `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...req.body,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        userId: req.user?.id,
        platform: req.user?.platform || 'fanzdash',
        verificationLevel: 'pending_review',
      };

      // In production, save to database
      creatorVerifications.push(verificationData);
      creatorVerificationStats.pendingReviews++;
      creatorVerificationStats.totalCreators++;

      // Log audit trail
      logger.info('Content Creator verification submitted', {
        verificationId: verificationData.id,
        userId: req.user?.id,
        fullLegalName: verificationData.fullLegalName,
        email: verificationData.emailAddress,
        platform: verificationData.platform,
      });

      // TODO: Trigger biometric verification process
      // TODO: Send confirmation email
      // TODO: Create 2257 record file

      res.status(201).json({
        message: 'Content Creator verification submitted successfully',
        verificationId: verificationData.id,
        status: 'pending',
        nextSteps: [
          'Await biometric verification results',
          'Admin will review documentation within 48 hours',
          'You will receive email notification upon approval',
          'Setup your 2FA authentication'
        ]
      });
    } catch (error) {
      logger.error('Error submitting creator verification:', error);
      res.status(500).json({ error: 'Failed to submit verification form' });
    }
  }
);

/**
 * GET /api/creator-verification/:id
 * Get specific creator verification details
 */
router.get('/:id',
  isAuthenticated,
  param('id').isString().notEmpty(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const verification = creatorVerifications.find(v => v.id === id);

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      // Only allow user to see their own verification, or moderators to see all
      if (verification.userId !== req.user?.id && req.user?.role !== 'moderator' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      res.json(verification);
    } catch (error) {
      logger.error('Error fetching verification details:', error);
      res.status(500).json({ error: 'Failed to fetch verification details' });
    }
  }
);

/**
 * PATCH /api/creator-verification/:id/approve
 * Approve creator verification
 */
router.patch('/:id/approve',
  isAuthenticated,
  requireSuperAdmin,
  param('id').isString().notEmpty(),
  [
    body('notes').optional().isString(),
    body('verificationLevel').optional().isIn(['basic', 'enhanced', 'full_compliance']),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes, verificationLevel = 'full_compliance' } = req.body;

      const verification = creatorVerifications.find(v => v.id === id);

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      verification.status = 'approved';
      verification.verificationLevel = verificationLevel;
      verification.approvedAt = new Date().toISOString();
      verification.approvedBy = req.user?.id;
      verification.reviewNotes = notes;

      creatorVerificationStats.pendingReviews--;
      creatorVerificationStats.approvedToday++;
      creatorVerificationStats.totalVerified++;

      // Log audit trail
      logger.info('Content Creator verification approved', {
        verificationId: id,
        approvedBy: req.user?.id,
        fullLegalName: verification.fullLegalName,
        verificationLevel,
      });

      // TODO: Send approval email
      // TODO: Grant creator access to platform
      // TODO: Create blockchain ID if opted in

      res.json({
        message: 'Content Creator verification approved successfully',
        verification,
      });
    } catch (error) {
      logger.error('Error approving verification:', error);
      res.status(500).json({ error: 'Failed to approve verification' });
    }
  }
);

/**
 * PATCH /api/creator-verification/:id/reject
 * Reject creator verification
 */
router.patch('/:id/reject',
  isAuthenticated,
  requireSuperAdmin,
  param('id').isString().notEmpty(),
  [
    body('reason').isString().notEmpty().withMessage('Rejection reason is required'),
    body('detailedFeedback').optional().isString(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, detailedFeedback } = req.body;

      const verification = creatorVerifications.find(v => v.id === id);

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      verification.status = 'rejected';
      verification.rejectedAt = new Date().toISOString();
      verification.rejectedBy = req.user?.id;
      verification.rejectionReason = reason;
      verification.detailedFeedback = detailedFeedback;

      creatorVerificationStats.pendingReviews--;
      creatorVerificationStats.rejectedToday++;

      // Log audit trail
      logger.info('Content Creator verification rejected', {
        verificationId: id,
        rejectedBy: req.user?.id,
        reason,
        fullLegalName: verification.fullLegalName,
      });

      // TODO: Send rejection email with feedback
      // TODO: Allow user to resubmit with corrections

      res.json({
        message: 'Content Creator verification rejected',
        verification,
      });
    } catch (error) {
      logger.error('Error rejecting verification:', error);
      res.status(500).json({ error: 'Failed to reject verification' });
    }
  }
);

/**
 * GET /api/creator-verification/:id/download-pdf
 * Download creator verification form as PDF
 */
router.get('/:id/download-pdf',
  isAuthenticated,
  requireSuperAdmin,
  param('id').isString().notEmpty(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const verification = creatorVerifications.find(v => v.id === id);

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      // TODO: Implement PDF generation with all form fields
      // TODO: Include biometric verification results
      // TODO: Include compliance officer signature

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

/**
 * GET /api/creator-verification/my/status
 * Get current user's verification status
 */
router.get('/my/status', isAuthenticated, async (req, res) => {
  try {
    const verification = creatorVerifications.find(v => v.userId === req.user?.id);

    if (!verification) {
      return res.json({
        verified: false,
        status: 'not_started',
        message: 'No verification found. Please complete creator verification.',
      });
    }

    res.json({
      verified: verification.status === 'approved',
      status: verification.status,
      verificationLevel: verification.verificationLevel,
      submittedAt: verification.submittedAt,
      approvedAt: verification.approvedAt,
      verificationId: verification.id,
    });
  } catch (error) {
    logger.error('Error fetching user verification status:', error);
    res.status(500).json({ error: 'Failed to fetch verification status' });
  }
});

export default router;
