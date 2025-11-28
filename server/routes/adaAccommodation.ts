import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { isAuthenticated, requireAdmin, requireModerator } from '../middleware/auth';
import { accommodationManager } from '../hr/ADAAccommodationManager';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { documentVault } from '../vault/DocumentVault';
import { createSecureUploadMiddleware } from '../middleware/fileScanningMiddleware';

const router = express.Router();

// Configure secure upload with virus scanning for medical documentation
const upload = createSecureUploadMiddleware({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for medical docs
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, PNG, DOC, and DOCX are allowed.'));
    }
  }
});

// Rate limiting
const accommodationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests' }
});

// Validation middleware
const handleValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// ============ ACCOMMODATION REQUESTS ============

/**
 * POST /api/ada-accommodation/requests
 * Submit a new accommodation request
 */
router.post('/requests',
  isAuthenticated,
  accommodationLimiter,
  [
    body('functionalLimitations').isArray().notEmpty().withMessage('Functional limitations required'),
    body('requestedAccommodation').notEmpty().withMessage('Requested accommodation required'),
    body('requestedAccommodationType').isArray().notEmpty().withMessage('Accommodation type required'),
    body('specificNeeds').notEmpty().withMessage('Specific needs description required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const employeeId = req.user?.id || 'unknown';
      const employeeName = req.user?.username || 'Unknown Employee';

      const requestId = accommodationManager.submitRequest({
        employeeId,
        employeeName,
        functionalLimitations: req.body.functionalLimitations,
        requestedAccommodation: req.body.requestedAccommodation,
        requestedAccommodationType: req.body.requestedAccommodationType,
        specificNeeds: req.body.specificNeeds,
        disabilityType: req.body.disabilityType
      });

      res.status(201).json({
        message: 'Accommodation request submitted successfully',
        requestId,
        notice: 'Your request will be reviewed and the interactive process will begin within 3 business days.'
      });
    } catch (error) {
      console.error('Error submitting accommodation request:', error);
      res.status(500).json({ error: 'Failed to submit request' });
    }
  }
);

/**
 * GET /api/ada-accommodation/requests
 * Get all accommodation requests (Admin/HR only)
 */
router.get('/requests',
  isAuthenticated,
  requireModerator,
  async (req, res) => {
    try {
      const { status, employeeId } = req.query;

      let requests;

      if (employeeId) {
        requests = accommodationManager.getRequestsByEmployee(employeeId as string);
      } else if (status) {
        requests = accommodationManager.getRequestsByStatus(status as string);
      } else {
        requests = accommodationManager.getAllRequests();
      }

      // Sanitize confidential notes for non-admin users
      const sanitizedRequests = requests.map(r => ({
        ...r,
        confidentialNotes: req.user?.role === 'admin' ? r.confidentialNotes : undefined
      }));

      res.json({
        requests: sanitizedRequests,
        total: requests.length
      });
    } catch (error) {
      console.error('Error fetching accommodation requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }
);

/**
 * GET /api/ada-accommodation/requests/my-requests
 * Get current user's accommodation requests
 */
router.get('/requests/my-requests',
  isAuthenticated,
  async (req, res) => {
    try {
      const employeeId = req.user?.id || 'unknown';
      const requests = accommodationManager.getRequestsByEmployee(employeeId);

      // Remove confidential notes from employee view
      const sanitizedRequests = requests.map(r => ({
        ...r,
        confidentialNotes: undefined
      }));

      res.json({
        requests: sanitizedRequests,
        total: requests.length
      });
    } catch (error) {
      console.error('Error fetching my requests:', error);
      res.status(500).json({ error: 'Failed to fetch your requests' });
    }
  }
);

/**
 * GET /api/ada-accommodation/requests/:id
 * Get specific accommodation request
 */
router.get('/requests/:id',
  isAuthenticated,
  param('id').isUUID(),
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = accommodationManager.getRequest(id);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check permissions - employee can only see their own, HR can see all
      const isOwnRequest = request.employeeId === req.user?.id;
      const isHR = req.user?.role === 'admin' || req.user?.role === 'moderator';

      if (!isOwnRequest && !isHR) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Sanitize confidential notes for non-admin users
      const sanitizedRequest = {
        ...request,
        confidentialNotes: req.user?.role === 'admin' ? request.confidentialNotes : undefined
      };

      res.json(sanitizedRequest);
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ error: 'Failed to fetch request' });
    }
  }
);

/**
 * GET /api/ada-accommodation/requests/pending
 * Get pending requests requiring action
 */
router.get('/requests/pending',
  isAuthenticated,
  requireModerator,
  async (req, res) => {
    try {
      const requests = accommodationManager.getPendingRequests();

      res.json({
        requests,
        total: requests.length
      });
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
  }
);

// ============ MEDICAL DOCUMENTATION ============

/**
 * POST /api/ada-accommodation/requests/:id/medical-documentation
 * Upload medical documentation
 */
router.post('/requests/:id/medical-documentation',
  isAuthenticated,
  param('id').isUUID(),
  upload.array('documents', 5), // Max 5 medical documents
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = accommodationManager.getRequest(id);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check permissions
      const isOwnRequest = request.employeeId === req.user?.id;
      const isHR = req.user?.role === 'admin' || req.user?.role === 'moderator';

      if (!isOwnRequest && !isHR) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Upload to DocumentVault with HIPAA protection
      const documentIds: string[] = [];

      for (const file of files) {
        const metadata = await documentVault.uploadDocument(
          file.buffer,
          file.originalname,
          file.mimetype,
          req.user?.id || 'unknown',
          {
            category: 'medical',
            tags: ['ada', 'accommodation', 'medical-documentation', 'hipaa-protected'],
            accessLevel: 'restricted', // Highest level of protection
            relatedEntityType: 'accommodation_request',
            relatedEntityId: id,
            description: 'Medical documentation for ADA accommodation request'
          }
        );

        documentIds.push(metadata.id);
      }

      // Record in accommodation system
      accommodationManager.recordMedicalDocumentation(id, documentIds);

      res.status(201).json({
        message: 'Medical documentation uploaded successfully',
        documentIds,
        notice: 'Your medical information is protected under HIPAA and will only be accessed by authorized personnel.'
      });
    } catch (error) {
      console.error('Error uploading medical documentation:', error);
      res.status(500).json({ error: 'Failed to upload documentation' });
    }
  }
);

// ============ INTERACTIVE PROCESS ============

/**
 * POST /api/ada-accommodation/requests/:id/meetings
 * Schedule interactive process meeting
 */
router.post('/requests/:id/meetings',
  isAuthenticated,
  requireModerator,
  [
    param('id').isUUID(),
    body('date').isISO8601().withMessage('Valid date required'),
    body('attendees').isArray().notEmpty().withMessage('Attendees required'),
    body('discussionTopics').isArray().notEmpty().withMessage('Discussion topics required'),
    body('accommodationsDiscussed').isArray().notEmpty().withMessage('Accommodations discussed required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      const meetingId = accommodationManager.scheduleInteractiveProcessMeeting(id, {
        date: new Date(req.body.date),
        attendees: req.body.attendees,
        discussionTopics: req.body.discussionTopics,
        accommodationsDiscussed: req.body.accommodationsDiscussed
      });

      res.status(201).json({
        message: 'Interactive process meeting scheduled',
        meetingId
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      res.status(500).json({ error: 'Failed to schedule meeting' });
    }
  }
);

/**
 * PATCH /api/ada-accommodation/requests/:id/meetings/:meetingId
 * Record meeting notes
 */
router.patch('/requests/:id/meetings/:meetingId',
  isAuthenticated,
  requireModerator,
  [
    param('id').isUUID(),
    param('meetingId').isUUID(),
    body('employeeFeedback').notEmpty().withMessage('Employee feedback required'),
    body('nextSteps').isArray().notEmpty().withMessage('Next steps required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id, meetingId } = req.params;

      accommodationManager.recordMeetingNotes(id, meetingId, {
        employeeFeedback: req.body.employeeFeedback,
        nextSteps: req.body.nextSteps,
        documentIds: req.body.documentIds
      });

      res.json({ message: 'Meeting notes recorded successfully' });
    } catch (error) {
      console.error('Error recording meeting notes:', error);
      res.status(500).json({ error: 'Failed to record notes' });
    }
  }
);

/**
 * POST /api/ada-accommodation/requests/:id/alternatives
 * Add alternative accommodation for consideration
 */
router.post('/requests/:id/alternatives',
  isAuthenticated,
  requireModerator,
  [
    param('id').isUUID(),
    body('description').notEmpty().withMessage('Description required'),
    body('effectiveness').isIn(['high', 'medium', 'low']).withMessage('Valid effectiveness required'),
    body('cost').isNumeric().withMessage('Cost must be numeric'),
    body('implementationTime').notEmpty().withMessage('Implementation time required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      accommodationManager.addAlternativeAccommodation(id, {
        description: req.body.description,
        effectiveness: req.body.effectiveness,
        cost: parseFloat(req.body.cost),
        implementationTime: req.body.implementationTime,
        reasonNotSelected: req.body.reasonNotSelected
      });

      res.status(201).json({ message: 'Alternative accommodation added' });
    } catch (error) {
      console.error('Error adding alternative:', error);
      res.status(500).json({ error: 'Failed to add alternative' });
    }
  }
);

// ============ DECISIONS ============

/**
 * POST /api/ada-accommodation/requests/:id/decision
 * Make accommodation decision
 */
router.post('/requests/:id/decision',
  isAuthenticated,
  requireAdmin, // Only admin can make final decisions
  [
    param('id').isUUID(),
    body('decision').isIn(['approved', 'denied', 'alternative_offered']).withMessage('Valid decision required'),
    body('reasonableAccommodationAnalysis').isObject().withMessage('Analysis required'),
    body('legalReview').isBoolean().withMessage('Legal review flag required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const decisionMaker = req.user?.id || 'unknown';

      accommodationManager.makeDecision(id, req.body, decisionMaker);

      res.json({
        message: 'Decision recorded successfully',
        notice: 'Employee will be notified of the decision'
      });
    } catch (error) {
      console.error('Error making decision:', error);
      res.status(500).json({ error: 'Failed to make decision' });
    }
  }
);

// ============ IMPLEMENTATION ============

/**
 * POST /api/ada-accommodation/requests/:id/implementation-plan
 * Create implementation plan
 */
router.post('/requests/:id/implementation-plan',
  isAuthenticated,
  requireModerator,
  [
    param('id').isUUID(),
    body('accommodationDetails').notEmpty().withMessage('Accommodation details required'),
    body('responsibleParty').notEmpty().withMessage('Responsible party required'),
    body('targetDate').isISO8601().withMessage('Valid target date required'),
    body('budget').isNumeric().withMessage('Budget must be numeric')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      accommodationManager.createImplementationPlan(id, {
        accommodationDetails: req.body.accommodationDetails,
        responsibleParty: req.body.responsibleParty,
        targetDate: new Date(req.body.targetDate),
        budget: parseFloat(req.body.budget),
        vendor: req.body.vendor,
        installationRequired: req.body.installationRequired || false,
        trainingRequired: req.body.trainingRequired || false
      });

      res.status(201).json({ message: 'Implementation plan created' });
    } catch (error) {
      console.error('Error creating implementation plan:', error);
      res.status(500).json({ error: 'Failed to create plan' });
    }
  }
);

/**
 * POST /api/ada-accommodation/requests/:id/milestones
 * Add implementation milestone
 */
router.post('/requests/:id/milestones',
  isAuthenticated,
  requireModerator,
  [
    param('id').isUUID(),
    body('description').notEmpty().withMessage('Description required'),
    body('dueDate').isISO8601().withMessage('Valid due date required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      accommodationManager.addMilestone(id, {
        description: req.body.description,
        dueDate: new Date(req.body.dueDate),
        notes: req.body.notes
      });

      res.status(201).json({ message: 'Milestone added' });
    } catch (error) {
      console.error('Error adding milestone:', error);
      res.status(500).json({ error: 'Failed to add milestone' });
    }
  }
);

/**
 * PATCH /api/ada-accommodation/requests/:id/milestones/complete
 * Complete implementation milestone
 */
router.patch('/requests/:id/milestones/complete',
  isAuthenticated,
  requireModerator,
  [
    param('id').isUUID(),
    body('milestoneDescription').notEmpty().withMessage('Milestone description required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      accommodationManager.completeMilestone(
        id,
        req.body.milestoneDescription,
        req.body.notes
      );

      res.json({ message: 'Milestone completed' });
    } catch (error) {
      console.error('Error completing milestone:', error);
      res.status(500).json({ error: 'Failed to complete milestone' });
    }
  }
);

// ============ EFFECTIVENESS REVIEWS ============

/**
 * POST /api/ada-accommodation/requests/:id/effectiveness-review
 * Conduct effectiveness review
 */
router.post('/requests/:id/effectiveness-review',
  isAuthenticated,
  requireModerator,
  [
    param('id').isUUID(),
    body('reviewedBy').notEmpty().withMessage('Reviewer required'),
    body('employeeSatisfaction').isInt({ min: 1, max: 5 }).withMessage('Satisfaction must be 1-5'),
    body('employeeFeedback').notEmpty().withMessage('Employee feedback required'),
    body('isEffective').isBoolean().withMessage('Effectiveness flag required'),
    body('issuesIdentified').isArray().withMessage('Issues must be array'),
    body('modificationsNeeded').isBoolean().withMessage('Modifications flag required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      accommodationManager.conductEffectivenessReview(id, {
        reviewedBy: req.body.reviewedBy,
        employeeSatisfaction: parseInt(req.body.employeeSatisfaction),
        employeeFeedback: req.body.employeeFeedback,
        isEffective: req.body.isEffective,
        issuesIdentified: req.body.issuesIdentified,
        modificationsNeeded: req.body.modificationsNeeded,
        proposedModifications: req.body.proposedModifications,
        followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : undefined
      });

      res.status(201).json({ message: 'Effectiveness review completed' });
    } catch (error) {
      console.error('Error conducting review:', error);
      res.status(500).json({ error: 'Failed to conduct review' });
    }
  }
);

// ============ APPEALS ============

/**
 * POST /api/ada-accommodation/requests/:id/appeal
 * File an appeal
 */
router.post('/requests/:id/appeal',
  isAuthenticated,
  [
    param('id').isUUID(),
    body('appealReason').notEmpty().withMessage('Appeal reason required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = accommodationManager.getRequest(id);

      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Check permissions - only the employee can appeal
      if (request.employeeId !== req.user?.id) {
        return res.status(403).json({ error: 'Only the employee can file an appeal' });
      }

      accommodationManager.fileAppeal(id, req.body.appealReason);

      res.status(201).json({
        message: 'Appeal filed successfully',
        notice: 'Your appeal will be reviewed by senior management'
      });
    } catch (error) {
      console.error('Error filing appeal:', error);
      res.status(500).json({ error: 'Failed to file appeal' });
    }
  }
);

/**
 * POST /api/ada-accommodation/requests/:id/appeal/decision
 * Decide on appeal
 */
router.post('/requests/:id/appeal/decision',
  isAuthenticated,
  requireAdmin,
  [
    param('id').isUUID(),
    body('decision').notEmpty().withMessage('Appeal decision required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const decisionMaker = req.user?.id || 'unknown';

      accommodationManager.decideAppeal(id, req.body.decision, decisionMaker);

      res.json({ message: 'Appeal decision recorded' });
    } catch (error) {
      console.error('Error deciding appeal:', error);
      res.status(500).json({ error: 'Failed to decide appeal' });
    }
  }
);

// ============ ANALYTICS AND REPORTING ============

/**
 * GET /api/ada-accommodation/statistics
 * Get accommodation statistics
 */
router.get('/statistics',
  isAuthenticated,
  requireModerator,
  async (req, res) => {
    try {
      const statistics = accommodationManager.getStatistics();

      // Convert Maps to Objects for JSON serialization
      const serialized = {
        ...statistics,
        byType: Object.fromEntries(statistics.byType),
        byStatus: Object.fromEntries(statistics.byStatus),
        costAnalysis: {
          ...statistics.costAnalysis,
          costByType: Object.fromEntries(statistics.costAnalysis.costByType)
        }
      };

      res.json(serialized);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }
);

/**
 * POST /api/ada-accommodation/requests/:id/notes
 * Add confidential note (Admin only)
 */
router.post('/requests/:id/notes',
  isAuthenticated,
  requireAdmin,
  [
    param('id').isUUID(),
    body('note').notEmpty().withMessage('Note required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;

      accommodationManager.addConfidentialNote(id, req.body.note);

      res.status(201).json({ message: 'Note added' });
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json({ error: 'Failed to add note' });
    }
  }
);

export default router;
