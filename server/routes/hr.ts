import express from 'express';
import multer from 'multer';
import { body, query, param, validationResult } from 'express-validator';
import { isAuthenticated, requireAdmin, requireModerator } from '../middleware/auth';
import { documentVault } from '../vault/DocumentVault';
import rateLimit from 'express-rate-limit';
import { createSecureUploadMiddleware } from '../middleware/fileScanningMiddleware';

const router = express.Router();

// Configure secure upload with virus scanning
const upload = createSecureUploadMiddleware({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// Rate limiting
const hrLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

// Mock data storage
const employees: any[] = [];
const jobPostings: any[] = [];
const applications: any[] = [];
const interviews: any[] = [];
const payroll: any[] = [];
const attendanceRecords: any[] = [];
const leaveRequests: any[] = [];
const performanceReviews: any[] = [];
const trainings: any[] = [];
const departments: any[] = [];
const benefits: any[] = [];
const grievances: any[] = [];

// Validation middleware
const handleValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// ============ EMPLOYEE MANAGEMENT ============

/**
 * GET /api/hr/employees
 * Get all employees
 */
router.get('/employees', isAuthenticated, hrLimiter, async (req, res) => {
  try {
    const { department, status, role, search, page = 1, limit = 50 } = req.query;

    let filtered = [...employees];

    if (department) {
      filtered = filtered.filter(e => e.department === department);
    }
    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }
    if (role) {
      filtered = filtered.filter(e => e.role === role);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(searchLower) ||
        e.email.toLowerCase().includes(searchLower) ||
        e.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.json({
      employees: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

/**
 * POST /api/hr/employees
 * Add new employee
 */
router.post('/employees',
  isAuthenticated,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('salary').optional().isNumeric()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const employee = {
        id: `emp_${Date.now()}`,
        employeeId: `EMP${Date.now().toString().slice(-6)}`,
        ...req.body,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      employees.push(employee);

      res.status(201).json({ message: 'Employee added successfully', employee });
    } catch (error) {
      console.error('Error adding employee:', error);
      res.status(500).json({ error: 'Failed to add employee' });
    }
  }
);

/**
 * POST /api/hr/employees/:id/upload
 * Upload employee documents (resume, contracts, certifications, etc.)
 */
router.post('/employees/:id/upload',
  isAuthenticated,
  requireModerator,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const employee = employees.find(e => e.id === id);

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const documentType = req.body.documentType || 'general'; // resume, contract, certification, etc.

      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'hr',
          tags: ['employee', id, documentType],
          description: req.body.description,
          relatedEntityType: 'employee',
          relatedEntityId: id,
          accessLevel: 'confidential'
        }
      );

      if (!employee.documents) {
        employee.documents = [];
      }
      employee.documents.push({
        documentId: metadata.id,
        fileName: metadata.originalName,
        type: documentType,
        uploadedAt: metadata.uploadedAt
      });

      res.json({
        message: 'Document uploaded successfully',
        document: metadata
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  }
);

/**
 * POST /api/hr/employees/import
 * Bulk import employees from CSV
 */
router.post('/employees/import',
  isAuthenticated,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file || req.file.mimetype !== 'text/csv') {
        return res.status(400).json({ error: 'CSV file required' });
      }

      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'hr',
          tags: ['employees', 'import', 'csv'],
          description: 'Employee import CSV'
        }
      );

      // Parse CSV
      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const importedEmployees = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());
        const empData: any = {};

        headers.forEach((header, index) => {
          empData[header] = values[index];
        });

        if (empData.name && empData.email) {
          const employee = {
            id: `emp_${Date.now()}_${i}`,
            employeeId: `EMP${Date.now().toString().slice(-6)}_${i}`,
            ...empData,
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: req.user?.id,
            importedFrom: metadata.id
          };
          employees.push(employee);
          importedEmployees.push(employee);
        }
      }

      res.json({
        message: 'Employees imported successfully',
        imported: importedEmployees.length,
        employees: importedEmployees
      });
    } catch (error) {
      console.error('Error importing employees:', error);
      res.status(500).json({ error: 'Failed to import employees' });
    }
  }
);

// ============ RECRUITMENT & JOB POSTINGS ============

/**
 * GET /api/hr/jobs
 * Get all job postings
 */
router.get('/jobs', isAuthenticated, async (req, res) => {
  try {
    const { status, department, type } = req.query;

    let filtered = [...jobPostings];

    if (status) {
      filtered = filtered.filter(j => j.status === status);
    }
    if (department) {
      filtered = filtered.filter(j => j.department === department);
    }
    if (type) {
      filtered = filtered.filter(j => j.type === type);
    }

    res.json({ jobs: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

/**
 * POST /api/hr/jobs
 * Create job posting
 */
router.post('/jobs',
  isAuthenticated,
  requireModerator,
  [
    body('title').notEmpty().withMessage('Job title is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('type').isIn(['full-time', 'part-time', 'contract', 'internship']),
    body('description').notEmpty().withMessage('Job description is required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const job = {
        id: `job_${Date.now()}`,
        ...req.body,
        status: 'open',
        postedDate: new Date().toISOString(),
        postedBy: req.user?.id,
        applicationsCount: 0
      };

      jobPostings.push(job);

      res.status(201).json({ message: 'Job posted successfully', job });
    } catch (error) {
      console.error('Error creating job posting:', error);
      res.status(500).json({ error: 'Failed to create job posting' });
    }
  }
);

/**
 * GET /api/hr/applications
 * Get all job applications
 */
router.get('/applications', isAuthenticated, async (req, res) => {
  try {
    const { jobId, status } = req.query;

    let filtered = [...applications];

    if (jobId) {
      filtered = filtered.filter(a => a.jobId === jobId);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    res.json({ applications: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * POST /api/hr/applications/submit
 * Submit job application (with resume upload)
 */
router.post('/applications/submit',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files.resume || files.resume.length === 0) {
        return res.status(400).json({ error: 'Resume is required' });
      }

      // Upload resume
      const resumeMetadata = await documentVault.uploadDocument(
        files.resume[0].buffer,
        files.resume[0].originalname,
        files.resume[0].mimetype,
        req.body.email || 'applicant',
        {
          category: 'hr',
          tags: ['application', 'resume', req.body.jobId],
          description: `Resume for ${req.body.name}`,
          relatedEntityType: 'application',
          relatedEntityId: req.body.jobId
        }
      );

      // Upload cover letter if provided
      let coverLetterMetadata = null;
      if (files.coverLetter && files.coverLetter.length > 0) {
        coverLetterMetadata = await documentVault.uploadDocument(
          files.coverLetter[0].buffer,
          files.coverLetter[0].originalname,
          files.coverLetter[0].mimetype,
          req.body.email || 'applicant',
          {
            category: 'hr',
            tags: ['application', 'cover-letter', req.body.jobId],
            description: `Cover letter for ${req.body.name}`
          }
        );
      }

      const application = {
        id: `app_${Date.now()}`,
        ...req.body,
        resumeId: resumeMetadata.id,
        coverLetterId: coverLetterMetadata?.id,
        status: 'submitted',
        submittedAt: new Date().toISOString()
      };

      applications.push(application);

      // Update job posting
      const job = jobPostings.find(j => j.id === req.body.jobId);
      if (job) {
        job.applicationsCount = (job.applicationsCount || 0) + 1;
      }

      res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
);

// ============ INTERVIEWS ============

/**
 * GET /api/hr/interviews
 * Get all interviews
 */
router.get('/interviews', isAuthenticated, async (req, res) => {
  try {
    const { applicationId, status, date } = req.query;

    let filtered = [...interviews];

    if (applicationId) {
      filtered = filtered.filter(i => i.applicationId === applicationId);
    }
    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }

    res.json({ interviews: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

/**
 * POST /api/hr/interviews
 * Schedule interview
 */
router.post('/interviews',
  isAuthenticated,
  requireModerator,
  [
    body('applicationId').notEmpty(),
    body('scheduledDate').isISO8601(),
    body('interviewers').isArray()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const interview = {
        id: `int_${Date.now()}`,
        ...req.body,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      interviews.push(interview);

      res.status(201).json({ message: 'Interview scheduled', interview });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      res.status(500).json({ error: 'Failed to schedule interview' });
    }
  }
);

// ============ PAYROLL ============

/**
 * GET /api/hr/payroll
 * Get payroll records
 */
router.get('/payroll', isAuthenticated, requireModerator, async (req, res) => {
  try {
    const { employeeId, month, year, status } = req.query;

    let filtered = [...payroll];

    if (employeeId) {
      filtered = filtered.filter(p => p.employeeId === employeeId);
    }
    if (month) {
      filtered = filtered.filter(p => p.month === Number(month));
    }
    if (year) {
      filtered = filtered.filter(p => p.year === Number(year));
    }
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }

    res.json({ payroll: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

/**
 * POST /api/hr/payroll
 * Process payroll
 */
router.post('/payroll',
  isAuthenticated,
  requireAdmin,
  [
    body('employeeId').notEmpty(),
    body('month').isInt({ min: 1, max: 12 }),
    body('year').isInt({ min: 2020 }),
    body('baseSalary').isNumeric(),
    body('allowances').optional().isNumeric(),
    body('deductions').optional().isNumeric()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { baseSalary, allowances = 0, deductions = 0 } = req.body;
      const netSalary = Number(baseSalary) + Number(allowances) - Number(deductions);

      const payrollRecord = {
        id: `pay_${Date.now()}`,
        ...req.body,
        netSalary,
        status: 'processed',
        processedAt: new Date().toISOString(),
        processedBy: req.user?.id
      };

      payroll.push(payrollRecord);

      res.status(201).json({ message: 'Payroll processed', payroll: payrollRecord });
    } catch (error) {
      console.error('Error processing payroll:', error);
      res.status(500).json({ error: 'Failed to process payroll' });
    }
  }
);

/**
 * POST /api/hr/payroll/import
 * Import payroll from Excel
 */
router.post('/payroll/import',
  isAuthenticated,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'hr',
          tags: ['payroll', 'import'],
          description: 'Payroll import file',
          accessLevel: 'restricted'
        }
      );

      res.json({
        message: 'Payroll file uploaded. Processing will complete shortly.',
        fileId: metadata.id
      });
    } catch (error) {
      console.error('Error importing payroll:', error);
      res.status(500).json({ error: 'Failed to import payroll' });
    }
  }
);

// ============ ATTENDANCE ============

/**
 * GET /api/hr/attendance
 * Get attendance records
 */
router.get('/attendance', isAuthenticated, async (req, res) => {
  try {
    const { employeeId, date, status } = req.query;

    let filtered = [...attendanceRecords];

    if (employeeId) {
      filtered = filtered.filter(a => a.employeeId === employeeId);
    }
    if (date) {
      filtered = filtered.filter(a => a.date === date);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    res.json({ attendance: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

/**
 * POST /api/hr/attendance
 * Record attendance
 */
router.post('/attendance',
  isAuthenticated,
  [
    body('employeeId').notEmpty(),
    body('date').isISO8601(),
    body('status').isIn(['present', 'absent', 'late', 'half-day', 'work-from-home'])
  ],
  handleValidation,
  async (req, res) => {
    try {
      const record = {
        id: `att_${Date.now()}`,
        ...req.body,
        recordedAt: new Date().toISOString(),
        recordedBy: req.user?.id
      };

      attendanceRecords.push(record);

      res.status(201).json({ message: 'Attendance recorded', record });
    } catch (error) {
      console.error('Error recording attendance:', error);
      res.status(500).json({ error: 'Failed to record attendance' });
    }
  }
);

// ============ LEAVE MANAGEMENT ============

/**
 * GET /api/hr/leave-requests
 * Get leave requests
 */
router.get('/leave-requests', isAuthenticated, async (req, res) => {
  try {
    const { employeeId, status, type } = req.query;

    let filtered = [...leaveRequests];

    if (employeeId) {
      filtered = filtered.filter(l => l.employeeId === employeeId);
    }
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }
    if (type) {
      filtered = filtered.filter(l => l.type === type);
    }

    res.json({ leaveRequests: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

/**
 * POST /api/hr/leave-requests
 * Submit leave request
 */
router.post('/leave-requests',
  isAuthenticated,
  [
    body('employeeId').notEmpty(),
    body('type').isIn(['vacation', 'sick', 'personal', 'maternity', 'paternity', 'unpaid']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('reason').notEmpty()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const request = {
        id: `leave_${Date.now()}`,
        ...req.body,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      leaveRequests.push(request);

      res.status(201).json({ message: 'Leave request submitted', request });
    } catch (error) {
      console.error('Error submitting leave request:', error);
      res.status(500).json({ error: 'Failed to submit leave request' });
    }
  }
);

// ============ PERFORMANCE REVIEWS ============

/**
 * GET /api/hr/performance-reviews
 * Get performance reviews
 */
router.get('/performance-reviews', isAuthenticated, async (req, res) => {
  try {
    const { employeeId, reviewerId, period } = req.query;

    let filtered = [...performanceReviews];

    if (employeeId) {
      filtered = filtered.filter(r => r.employeeId === employeeId);
    }
    if (reviewerId) {
      filtered = filtered.filter(r => r.reviewerId === reviewerId);
    }
    if (period) {
      filtered = filtered.filter(r => r.period === period);
    }

    res.json({ reviews: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * POST /api/hr/performance-reviews
 * Create performance review
 */
router.post('/performance-reviews',
  isAuthenticated,
  requireModerator,
  [
    body('employeeId').notEmpty(),
    body('reviewerId').notEmpty(),
    body('period').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('feedback').notEmpty()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const review = {
        id: `review_${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString()
      };

      performanceReviews.push(review);

      res.status(201).json({ message: 'Performance review created', review });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
);

// ============ TRAINING & DEVELOPMENT ============

/**
 * GET /api/hr/trainings
 * Get training programs
 */
router.get('/trainings', isAuthenticated, async (req, res) => {
  try {
    const { status, type } = req.query;

    let filtered = [...trainings];

    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    res.json({ trainings: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    res.status(500).json({ error: 'Failed to fetch trainings' });
  }
});

/**
 * POST /api/hr/trainings
 * Create training program
 */
router.post('/trainings',
  isAuthenticated,
  requireModerator,
  [
    body('title').notEmpty(),
    body('type').isIn(['technical', 'soft-skills', 'compliance', 'leadership', 'other']),
    body('startDate').isISO8601(),
    body('endDate').optional().isISO8601()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const training = {
        id: `training_${Date.now()}`,
        ...req.body,
        status: 'upcoming',
        enrolledCount: 0,
        createdAt: new Date().toISOString()
      };

      trainings.push(training);

      res.status(201).json({ message: 'Training created', training });
    } catch (error) {
      console.error('Error creating training:', error);
      res.status(500).json({ error: 'Failed to create training' });
    }
  }
);

/**
 * POST /api/hr/trainings/:id/upload
 * Upload training materials
 */
router.post('/trainings/:id/upload',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const training = trainings.find(t => t.id === id);

      if (!training) {
        return res.status(404).json({ error: 'Training not found' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'hr',
          tags: ['training', id],
          description: req.body.description,
          relatedEntityType: 'training',
          relatedEntityId: id
        }
      );

      if (!training.materials) {
        training.materials = [];
      }
      training.materials.push({
        documentId: metadata.id,
        fileName: metadata.originalName,
        uploadedAt: metadata.uploadedAt
      });

      res.json({
        message: 'Training material uploaded',
        document: metadata
      });
    } catch (error) {
      console.error('Error uploading material:', error);
      res.status(500).json({ error: 'Failed to upload material' });
    }
  }
);

// ============ ANALYTICS ============

/**
 * GET /api/hr/analytics/dashboard
 * Get HR dashboard analytics
 */
router.get('/analytics/dashboard', isAuthenticated, async (req, res) => {
  try {
    const analytics = {
      employees: {
        total: employees.length,
        active: employees.filter(e => e.status === 'active').length,
        onLeave: leaveRequests.filter(l => l.status === 'approved' && new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date()).length,
        newHires: employees.filter(e => {
          const startDate = new Date(e.startDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return startDate > thirtyDaysAgo;
        }).length
      },
      recruitment: {
        openPositions: jobPostings.filter(j => j.status === 'open').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(a => a.status === 'submitted').length,
        scheduledInterviews: interviews.filter(i => i.status === 'scheduled').length
      },
      attendance: {
        todayPresent: attendanceRecords.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'present').length,
        todayAbsent: attendanceRecords.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'absent').length,
        averageAttendance: attendanceRecords.length > 0 ? ((attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length) * 100).toFixed(2) : 0
      },
      leave: {
        pendingRequests: leaveRequests.filter(l => l.status === 'pending').length,
        approvedThisMonth: leaveRequests.filter(l => {
          const approved = new Date(l.approvedAt || 0);
          const now = new Date();
          return l.status === 'approved' && approved.getMonth() === now.getMonth() && approved.getFullYear() === now.getFullYear();
        }).length
      },
      performance: {
        reviewsDue: performanceReviews.filter(r => r.status === 'pending').length,
        averageRating: performanceReviews.length > 0 ? (performanceReviews.reduce((sum, r) => sum + r.rating, 0) / performanceReviews.length).toFixed(2) : 0
      },
      training: {
        upcomingPrograms: trainings.filter(t => t.status === 'upcoming').length,
        ongoingPrograms: trainings.filter(t => t.status === 'ongoing').length,
        completedPrograms: trainings.filter(t => t.status === 'completed').length
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching HR analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
