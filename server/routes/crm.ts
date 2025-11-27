import express from 'express';
import multer from 'multer';
import { body, query, param, validationResult } from 'express-validator';
import { isAuthenticated, requireAdmin, requireModerator } from '../middleware/auth';
import { documentVault } from '../vault/DocumentVault';
import rateLimit from 'express-rate-limit';
import {
  emailTemplates,
  proposalTemplates,
  workflowTemplates
} from '../services/crmTemplates';
import { createSecureUploadMiddleware } from '../middleware/fileScanningMiddleware';

const router = express.Router();

// Configure secure upload with virus scanning (memory storage for encryption)
const upload = createSecureUploadMiddleware({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.ms-excel',
      'text/plain',
      'application/json'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Rate limiting
const crmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

// Mock data storage (replace with database in production)
const leads: any[] = [];
const clients: any[] = [];
const deals: any[] = [];
const tasks: any[] = [];
const activities: any[] = [];
const proposals: any[] = [];
const contacts: any[] = [];
const pipelines: any[] = [];
const campaigns: any[] = [];

// Validation middleware
const handleValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// ============ LEADS MANAGEMENT ============

/**
 * GET /api/crm/leads
 * Get all leads with filtering and pagination
 */
router.get('/leads', isAuthenticated, crmLimiter, async (req, res) => {
  try {
    const { status, source, assignedTo, search, page = 1, limit = 50 } = req.query;

    let filtered = [...leads];

    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }
    if (source) {
      filtered = filtered.filter(l => l.source === source);
    }
    if (assignedTo) {
      filtered = filtered.filter(l => l.assignedTo === assignedTo);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(searchLower) ||
        l.email.toLowerCase().includes(searchLower) ||
        l.company?.toLowerCase().includes(searchLower)
      );
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paginatedLeads = filtered.slice(start, start + limitNum);

    res.json({
      leads: paginatedLeads,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum)
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

/**
 * POST /api/crm/leads
 * Create a new lead
 */
router.post('/leads',
  isAuthenticated,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone('any'),
    body('company').optional().isString(),
    body('source').optional().isString(),
    body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'])
  ],
  handleValidation,
  async (req, res) => {
    try {
      const lead = {
        id: `lead_${Date.now()}`,
        ...req.body,
        status: req.body.status || 'new',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id,
        updatedAt: new Date().toISOString()
      };

      leads.push(lead);

      res.status(201).json({ message: 'Lead created successfully', lead });
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({ error: 'Failed to create lead' });
    }
  }
);

/**
 * POST /api/crm/leads/:id/upload
 * Upload documents for a lead (contracts, proposals, etc.)
 */
router.post('/leads/:id/upload',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const lead = leads.find(l => l.id === id);

      if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Upload to document vault
      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'crm',
          tags: ['lead', id],
          description: req.body.description,
          relatedEntityType: 'lead',
          relatedEntityId: id
        }
      );

      // Add document reference to lead
      if (!lead.documents) {
        lead.documents = [];
      }
      lead.documents.push({
        documentId: metadata.id,
        fileName: metadata.originalName,
        uploadedAt: metadata.uploadedAt,
        uploadedBy: metadata.uploadedBy
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
 * POST /api/crm/leads/import
 * Bulk import leads from CSV
 */
router.post('/leads/import',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (req.file.mimetype !== 'text/csv') {
        return res.status(400).json({ error: 'Only CSV files are allowed' });
      }

      // Store the CSV file
      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'crm',
          tags: ['leads', 'import', 'csv'],
          description: 'Lead import CSV'
        }
      );

      // Parse CSV and create leads (simplified - use proper CSV parser in production)
      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const importedLeads = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());
        const leadData: any = {};

        headers.forEach((header, index) => {
          leadData[header] = values[index];
        });

        if (leadData.name && leadData.email) {
          const lead = {
            id: `lead_${Date.now()}_${i}`,
            ...leadData,
            status: leadData.status || 'new',
            source: 'csv_import',
            createdAt: new Date().toISOString(),
            createdBy: req.user?.id,
            importedFrom: metadata.id
          };
          leads.push(lead);
          importedLeads.push(lead);
        }
      }

      res.json({
        message: 'Leads imported successfully',
        imported: importedLeads.length,
        leads: importedLeads
      });
    } catch (error) {
      console.error('Error importing leads:', error);
      res.status(500).json({ error: 'Failed to import leads' });
    }
  }
);

// ============ CLIENTS MANAGEMENT ============

/**
 * GET /api/crm/clients
 * Get all clients
 */
router.get('/clients', isAuthenticated, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    let filtered = [...clients];

    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        c.company?.toLowerCase().includes(searchLower)
      );
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.json({
      clients: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

/**
 * POST /api/crm/clients
 * Create a new client
 */
router.post('/clients',
  isAuthenticated,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('company').optional().isString(),
    body('industry').optional().isString(),
    body('status').optional().isIn(['active', 'inactive', 'pending'])
  ],
  handleValidation,
  async (req, res) => {
    try {
      const client = {
        id: `client_${Date.now()}`,
        ...req.body,
        status: req.body.status || 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id,
        lifetime_value: 0,
        total_deals: 0
      };

      clients.push(client);

      res.status(201).json({ message: 'Client created successfully', client });
    } catch (error) {
      console.error('Error creating client:', error);
      res.status(500).json({ error: 'Failed to create client' });
    }
  }
);

/**
 * POST /api/crm/clients/:id/upload
 * Upload documents for a client
 */
router.post('/clients/:id/upload',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const client = clients.find(c => c.id === id);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
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
          category: 'crm',
          tags: ['client', id],
          description: req.body.description,
          relatedEntityType: 'client',
          relatedEntityId: id
        }
      );

      if (!client.documents) {
        client.documents = [];
      }
      client.documents.push({
        documentId: metadata.id,
        fileName: metadata.originalName,
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

// ============ DEALS MANAGEMENT ============

/**
 * GET /api/crm/deals/all
 * Get all deals
 */
router.get('/deals/all', isAuthenticated, async (req, res) => {
  try {
    const { status, stage, clientId, search } = req.query;

    let filtered = [...deals];

    if (status) {
      filtered = filtered.filter(d => d.status === status);
    }
    if (stage) {
      filtered = filtered.filter(d => d.stage === stage);
    }
    if (clientId) {
      filtered = filtered.filter(d => d.clientId === clientId);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(d => d.title.toLowerCase().includes(searchLower));
    }

    res.json({ deals: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

/**
 * POST /api/crm/deals
 * Create a new deal
 */
router.post('/deals',
  isAuthenticated,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('clientId').notEmpty().withMessage('Client ID is required'),
    body('value').isNumeric().withMessage('Value must be numeric'),
    body('stage').optional().isString(),
    body('probability').optional().isInt({ min: 0, max: 100 })
  ],
  handleValidation,
  async (req, res) => {
    try {
      const deal = {
        id: `deal_${Date.now()}`,
        ...req.body,
        stage: req.body.stage || 'prospecting',
        status: 'open',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id,
        expectedCloseDate: req.body.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      deals.push(deal);

      res.status(201).json({ message: 'Deal created successfully', deal });
    } catch (error) {
      console.error('Error creating deal:', error);
      res.status(500).json({ error: 'Failed to create deal' });
    }
  }
);

// ============ TASKS MANAGEMENT ============

/**
 * GET /api/crm/tasks
 * Get all tasks
 */
router.get('/tasks', isAuthenticated, async (req, res) => {
  try {
    const { status, priority, assignedTo, dueDate } = req.query;

    let filtered = [...tasks];

    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    if (priority) {
      filtered = filtered.filter(t => t.priority === priority);
    }
    if (assignedTo) {
      filtered = filtered.filter(t => t.assignedTo === assignedTo);
    }

    res.json({ tasks: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * POST /api/crm/tasks
 * Create a new task
 */
router.post('/tasks',
  isAuthenticated,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('dueDate').optional().isISO8601()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const task = {
        id: `task_${Date.now()}`,
        ...req.body,
        status: 'pending',
        priority: req.body.priority || 'medium',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      tasks.push(task);

      res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }
);

// ============ ACTIVITIES/NOTES ============

/**
 * GET /api/crm/activities
 * Get all activities
 */
router.get('/activities', isAuthenticated, async (req, res) => {
  try {
    const { entityType, entityId, type } = req.query;

    let filtered = [...activities];

    if (entityType) {
      filtered = filtered.filter(a => a.entityType === entityType);
    }
    if (entityId) {
      filtered = filtered.filter(a => a.entityId === entityId);
    }
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }

    res.json({ activities: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * POST /api/crm/activities
 * Log a new activity
 */
router.post('/activities',
  isAuthenticated,
  [
    body('type').isIn(['note', 'call', 'email', 'meeting', 'task_completed', 'status_change']),
    body('entityType').isIn(['lead', 'client', 'deal']),
    body('entityId').notEmpty(),
    body('content').notEmpty()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const activity = {
        id: `activity_${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      activities.push(activity);

      res.status(201).json({ message: 'Activity logged successfully', activity });
    } catch (error) {
      console.error('Error logging activity:', error);
      res.status(500).json({ error: 'Failed to log activity' });
    }
  }
);

// ============ PROPOSALS ============

/**
 * GET /api/crm/proposals
 * Get all proposals
 */
router.get('/proposals', isAuthenticated, async (req, res) => {
  try {
    const { status, dealId } = req.query;

    let filtered = [...proposals];

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (dealId) {
      filtered = filtered.filter(p => p.dealId === dealId);
    }

    res.json({ proposals: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

/**
 * POST /api/crm/proposals/upload
 * Upload a proposal document
 */
router.post('/proposals/upload',
  isAuthenticated,
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
          category: 'crm',
          tags: ['proposal'],
          description: req.body.description,
          relatedEntityType: 'proposal',
          relatedEntityId: req.body.dealId
        }
      );

      const proposal = {
        id: `proposal_${Date.now()}`,
        dealId: req.body.dealId,
        title: req.body.title || req.file.originalname,
        documentId: metadata.id,
        status: 'draft',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      proposals.push(proposal);

      res.json({
        message: 'Proposal uploaded successfully',
        proposal
      });
    } catch (error) {
      console.error('Error uploading proposal:', error);
      res.status(500).json({ error: 'Failed to upload proposal' });
    }
  }
);

// ============ ANALYTICS & REPORTING ============

/**
 * GET /api/crm/analytics/dashboard
 * Get CRM dashboard analytics
 */
router.get('/analytics/dashboard', isAuthenticated, async (req, res) => {
  try {
    const analytics = {
      leads: {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        qualified: leads.filter(l => l.status === 'qualified').length,
        converted: leads.filter(l => l.status === 'won').length,
        conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'won').length / leads.length * 100).toFixed(2) : 0
      },
      clients: {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        inactive: clients.filter(c => c.status === 'inactive').length
      },
      deals: {
        total: deals.length,
        open: deals.filter(d => d.status === 'open').length,
        won: deals.filter(d => d.status === 'won').length,
        totalValue: deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0),
        avgDealSize: deals.length > 0 ? (deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0) / deals.length).toFixed(2) : 0
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        overdue: tasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate) < new Date()).length,
        completed: tasks.filter(t => t.status === 'completed').length
      },
      recentActivities: activities.slice(-10).reverse()
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============ TEMPLATES ============

/**
 * GET /api/crm/templates/email
 * Get all email templates
 */
router.get('/templates/email', isAuthenticated, async (req, res) => {
  try {
    const { category } = req.query;

    let filtered = emailTemplates;
    if (category) {
      filtered = emailTemplates.filter(t => t.category === category);
    }

    res.json({
      templates: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

/**
 * GET /api/crm/templates/email/:id
 * Get specific email template by ID
 */
router.get('/templates/email/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const template = emailTemplates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
});

/**
 * POST /api/crm/templates/email/:id/render
 * Render an email template with provided variables
 */
router.post('/templates/email/:id/render',
  isAuthenticated,
  [
    body('variables').isObject().withMessage('Variables must be an object')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { variables } = req.body;

      const template = emailTemplates.find(t => t.id === id);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // Simple template variable substitution
      let renderedSubject = template.subject;
      let renderedBody = template.body;

      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        renderedSubject = renderedSubject.replace(regex, variables[key]);
        renderedBody = renderedBody.replace(regex, variables[key]);
      });

      res.json({
        template: {
          id: template.id,
          name: template.name,
          category: template.category
        },
        rendered: {
          subject: renderedSubject,
          body: renderedBody
        },
        missingVariables: template.variables.filter(v => !variables[v])
      });
    } catch (error) {
      console.error('Error rendering email template:', error);
      res.status(500).json({ error: 'Failed to render email template' });
    }
  }
);

/**
 * GET /api/crm/templates/proposals
 * Get all proposal templates
 */
router.get('/templates/proposals', isAuthenticated, async (req, res) => {
  try {
    res.json({
      templates: proposalTemplates,
      total: proposalTemplates.length
    });
  } catch (error) {
    console.error('Error fetching proposal templates:', error);
    res.status(500).json({ error: 'Failed to fetch proposal templates' });
  }
});

/**
 * GET /api/crm/templates/proposals/:id
 * Get specific proposal template by ID
 */
router.get('/templates/proposals/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const template = proposalTemplates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Error fetching proposal template:', error);
    res.status(500).json({ error: 'Failed to fetch proposal template' });
  }
});

/**
 * GET /api/crm/templates/workflows
 * Get all workflow templates
 */
router.get('/templates/workflows', isAuthenticated, async (req, res) => {
  try {
    res.json({
      templates: workflowTemplates,
      total: workflowTemplates.length
    });
  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    res.status(500).json({ error: 'Failed to fetch workflow templates' });
  }
});

/**
 * GET /api/crm/templates/workflows/:id
 * Get specific workflow template by ID
 */
router.get('/templates/workflows/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const template = workflowTemplates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Error fetching workflow template:', error);
    res.status(500).json({ error: 'Failed to fetch workflow template' });
  }
});

export default router;
