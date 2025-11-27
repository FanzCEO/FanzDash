import express from 'express';
import { fanzHubVault } from '../vault/FanzHubVault.js';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Rate limiting for vault operations (more restrictive due to sensitive data)
const vaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many vault requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 admin requests per 15 minutes
  message: { error: 'Admin rate limit exceeded.' },
});

// Input validation
const validateKYC = [
  body('userId').isString().notEmpty().withMessage('User ID is required'),
  body('kycData.documentType').isIn(['government_id', 'passport', 'drivers_license', 'utility_bill', 'bank_statement']).withMessage('Invalid document type'),
  body('kycData.issuingCountry').isString().notEmpty().withMessage('Issuing country is required'),
  body('kycData.verificationStatus').isIn(['pending', 'verified', 'rejected', 'expired']).withMessage('Invalid verification status'),
  body('accessorId').isString().notEmpty().withMessage('Accessor ID is required')
];

const validateAgeVerification = [
  body('userId').isString().notEmpty().withMessage('User ID is required'),
  body('ageData.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('ageData.verificationMethod').isIn(['document', 'credit_card', 'database_check', 'third_party']).withMessage('Invalid verification method'),
  body('ageData.isVerified').isBoolean().withMessage('Verification status must be boolean'),
  body('ageData.minimumAge').isInt({ min: 18, max: 25 }).withMessage('Minimum age must be between 18 and 25'),
  body('accessorId').isString().notEmpty().withMessage('Accessor ID is required')
];

const validate2257Record = [
  body('userId').isString().notEmpty().withMessage('User ID is required'),
  body('complianceData.performerName').isString().notEmpty().withMessage('Performer name is required'),
  body('complianceData.legalName').isString().notEmpty().withMessage('Legal name is required'),
  body('complianceData.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('complianceData.ageAtRecording').isInt({ min: 18 }).withMessage('Age at recording must be at least 18'),
  body('complianceData.documentType').isString().notEmpty().withMessage('Document type is required'),
  body('complianceData.documentNumber').isString().notEmpty().withMessage('Document number is required'),
  body('complianceData.issuingAuthority').isString().notEmpty().withMessage('Issuing authority is required'),
  body('complianceData.custodianName').isString().notEmpty().withMessage('Custodian name is required'),
  body('complianceData.custodianAddress').isString().notEmpty().withMessage('Custodian address is required'),
  body('complianceData.contentProducer').isString().notEmpty().withMessage('Content producer is required'),
  body('complianceData.contentTitle').isString().notEmpty().withMessage('Content title is required'),
  body('complianceData.recordingDate').isISO8601().withMessage('Valid recording date is required'),
  body('accessorId').isString().notEmpty().withMessage('Accessor ID is required')
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

// Basic authentication middleware (in production, use proper JWT validation)
const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization header required',
      message: 'Please provide a valid bearer token'
    });
  }
  // In production, validate the JWT token here
  next();
};

// Admin authorization middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminKey = req.headers['x-admin-key'];
  if (process.env.NODE_ENV === 'production' && !adminKey) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// KYC Document Management Routes

// Store KYC document
router.post('/kyc', vaultLimiter, isAuthenticated, validateKYC, checkValidation, async (req, res) => {
  try {
    const { userId, kycData, accessorId } = req.body;
    
    console.log('Storing KYC document:', {
      userId,
      documentType: kycData.documentType,
      issuingCountry: kycData.issuingCountry,
      verificationStatus: kycData.verificationStatus,
      accessorId,
      ip: req.ip,
      timestamp: new Date()
    });

    const recordId = await fanzHubVault.storeKYCDocument(userId, kycData, accessorId);

    res.json({
      success: true,
      recordId,
      message: 'KYC document stored successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error storing KYC document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store KYC document',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Retrieve KYC document
router.get('/kyc/:recordId', vaultLimiter, isAuthenticated, async (req, res) => {
  try {
    const { recordId } = req.params;
    const { accessorId, reason } = req.query;

    if (!accessorId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: accessorId, reason'
      });
    }

    console.log('Retrieving KYC document:', {
      recordId,
      accessorId,
      reason,
      ip: req.ip,
      timestamp: new Date()
    });

    const kycDocument = await fanzHubVault.retrieveKYCDocument(recordId, accessorId as string, reason as string);

    if (!kycDocument) {
      return res.status(404).json({
        success: false,
        error: 'KYC document not found or access denied',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: kycDocument,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving KYC document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve KYC document',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Age Verification Routes

// Store age verification
router.post('/age-verification', vaultLimiter, isAuthenticated, validateAgeVerification, checkValidation, async (req, res) => {
  try {
    const { userId, ageData, accessorId } = req.body;
    
    console.log('Storing age verification:', {
      userId,
      verificationMethod: ageData.verificationMethod,
      isVerified: ageData.isVerified,
      minimumAge: ageData.minimumAge,
      accessorId,
      ip: req.ip,
      timestamp: new Date()
    });

    // Convert date strings to Date objects
    ageData.dateOfBirth = new Date(ageData.dateOfBirth);
    ageData.verificationDate = new Date(ageData.verificationDate || Date.now());

    const recordId = await fanzHubVault.storeAgeVerification(userId, ageData, accessorId);

    res.json({
      success: true,
      recordId,
      message: 'Age verification stored successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error storing age verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store age verification',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 2257 Compliance Record Routes

// Store 2257 compliance record
router.post('/2257-record', vaultLimiter, isAuthenticated, validate2257Record, checkValidation, async (req, res) => {
  try {
    const { userId, complianceData, accessorId } = req.body;
    
    console.log('Storing 2257 compliance record:', {
      userId,
      performerName: complianceData.performerName,
      legalName: complianceData.legalName,
      ageAtRecording: complianceData.ageAtRecording,
      contentTitle: complianceData.contentTitle,
      accessorId,
      ip: req.ip,
      timestamp: new Date()
    });

    // Convert date strings to Date objects
    complianceData.dateOfBirth = new Date(complianceData.dateOfBirth);
    complianceData.recordCreationDate = new Date(complianceData.recordCreationDate || Date.now());
    complianceData.recordingDate = new Date(complianceData.recordingDate);

    const recordId = await fanzHubVault.store2257Record(userId, complianceData, accessorId);

    res.json({
      success: true,
      recordId,
      message: '2257 compliance record stored successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error storing 2257 compliance record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store 2257 compliance record',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Generic record retrieval
router.get('/record/:recordId', vaultLimiter, isAuthenticated, async (req, res) => {
  try {
    const { recordId } = req.params;
    const { accessorId, reason } = req.query;

    if (!accessorId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: accessorId, reason'
      });
    }

    console.log('Retrieving vault record:', {
      recordId,
      accessorId,
      reason,
      ip: req.ip,
      timestamp: new Date()
    });

    const record = await fanzHubVault.retrieveRecord(recordId, accessorId as string, reason as string);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found or access denied',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: record,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error retrieving vault record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve vault record',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Admin Routes

// Get vault statistics
router.get('/admin/statistics', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const stats = await fanzHubVault.getVaultStatistics();
    
    res.json({
      success: true,
      statistics: {
        ...stats,
        recordsByType: Object.fromEntries(stats.recordsByType)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting vault statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get vault statistics',
      timestamp: new Date().toISOString()
    });
  }
});

// Get user records list
router.get('/admin/users/:userId/records', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { accessorId } = req.query;

    if (!accessorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: accessorId'
      });
    }

    const records = await fanzHubVault.getUserRecords(userId, accessorId as string);

    res.json({
      success: true,
      userId,
      recordCount: records.length,
      records,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting user records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user records',
      timestamp: new Date().toISOString()
    });
  }
});

// Generate compliance report
router.get('/admin/compliance-report', adminLimiter, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameters: startDate, endDate'
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'
      });
    }

    const report = await fanzHubVault.getComplianceReport(start, end);

    res.json({
      success: true,
      report,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate compliance report',
      timestamp: new Date().toISOString()
    });
  }
});

// Vault health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'FanzHubVault',
    status: 'operational',
    version: '1.0.0',
    features: [
      'AES-256-GCM encryption',
      'Data integrity verification',
      'Automated retention policies',
      'Audit logging',
      'Compliance monitoring',
      'Secure deletion',
      '18 USC 2257 compliance',
      'KYC document management',
      'Age verification storage'
    ],
    securityFeatures: [
      'End-to-end encryption',
      'Access control',
      'Audit trails',
      'Data retention policies',
      'Secure key management',
      'Multi-layer validation'
    ],
    complianceStandards: [
      '18 USC 2257 - Record Keeping Requirements',
      'GDPR - Data Protection',
      'PCI DSS - Payment Card Industry',
      'DoD 5220.22-M - Secure Deletion'
    ],
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for development (remove in production)
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/test-store', async (req, res) => {
    try {
      // Test KYC document
      const testKYC = {
        documentType: 'government_id',
        documentNumber: 'TEST123456',
        issuingCountry: 'US',
        verificationStatus: 'verified',
        verificationDate: new Date(),
        verifiedBy: 'test-system'
      };

      const kycRecordId = await fanzHubVault.storeKYCDocument('test-user-123', testKYC as any, 'test-admin');

      // Test age verification
      const testAge = {
        dateOfBirth: new Date('1995-01-01'),
        verificationMethod: 'document',
        verificationProvider: 'test-provider',
        verificationDate: new Date(),
        isVerified: true,
        minimumAge: 18
      };

      const ageRecordId = await fanzHubVault.storeAgeVerification('test-user-123', testAge as any, 'test-admin');

      res.json({
        success: true,
        message: 'Test records stored successfully',
        records: {
          kyc: kycRecordId,
          age: ageRecordId
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Test storage failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}

export default router;