import express from 'express';
import multer from 'multer';
import { body, query, param, validationResult } from 'express-validator';
import { isAuthenticated, requireAdmin } from '../middleware/auth';
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
const erpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

// Mock data storage
const inventory: any[] = [];
const projects: any[] = [];
const resources: any[] = [];
const accounts: any[] = [];
const budgets: any[] = [];
const transactions: any[] = [];
const purchaseOrders: any[] = [];
const suppliers: any[] = [];
const assets: any[] = [];
const workflows: any[] = [];

// Validation middleware
const handleValidation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// ============ INVENTORY MANAGEMENT ============

/**
 * GET /api/erp/inventory
 * Get all inventory items
 */
router.get('/inventory', isAuthenticated, erpLimiter, async (req, res) => {
  try {
    const { category, status, lowStock, search, page = 1, limit = 50 } = req.query;

    let filtered = [...inventory];

    if (category) {
      filtered = filtered.filter(i => i.category === category);
    }
    if (status) {
      filtered = filtered.filter(i => i.status === status);
    }
    if (lowStock === 'true') {
      filtered = filtered.filter(i => i.quantity <= i.reorderLevel);
    }
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(searchLower) ||
        i.sku?.toLowerCase().includes(searchLower)
      );
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(start, start + limitNum);

    res.json({
      items: paginated,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      lowStockCount: inventory.filter(i => i.quantity <= i.reorderLevel).length
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * POST /api/erp/inventory
 * Add new inventory item
 */
router.post('/inventory',
  isAuthenticated,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
    body('unitPrice').isNumeric().withMessage('Unit price must be numeric'),
    body('reorderLevel').optional().isInt({ min: 0 })
  ],
  handleValidation,
  async (req, res) => {
    try {
      const item = {
        id: `inv_${Date.now()}`,
        ...req.body,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id,
        lastUpdated: new Date().toISOString()
      };

      inventory.push(item);

      res.status(201).json({ message: 'Inventory item created', item });
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({ error: 'Failed to create inventory item' });
    }
  }
);

/**
 * POST /api/erp/inventory/import
 * Import inventory from CSV
 */
router.post('/inventory/import',
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

      // Store the CSV
      const metadata = await documentVault.uploadDocument(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user?.id || 'unknown',
        {
          category: 'erp',
          tags: ['inventory', 'import', 'csv'],
          description: 'Inventory import CSV'
        }
      );

      // Parse CSV
      const csvContent = req.file.buffer.toString('utf-8');
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const importedItems = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim());
        const itemData: any = {};

        headers.forEach((header, index) => {
          itemData[header] = values[index];
        });

        if (itemData.name && itemData.sku) {
          const item = {
            id: `inv_${Date.now()}_${i}`,
            ...itemData,
            status: 'active',
            createdAt: new Date().toISOString(),
            createdBy: req.user?.id,
            importedFrom: metadata.id
          };
          inventory.push(item);
          importedItems.push(item);
        }
      }

      res.json({
        message: 'Inventory imported successfully',
        imported: importedItems.length,
        items: importedItems
      });
    } catch (error) {
      console.error('Error importing inventory:', error);
      res.status(500).json({ error: 'Failed to import inventory' });
    }
  }
);

// ============ PROJECT MANAGEMENT ============

/**
 * GET /api/erp/projects
 * Get all projects
 */
router.get('/projects', isAuthenticated, async (req, res) => {
  try {
    const { status, priority, managerId } = req.query;

    let filtered = [...projects];

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (priority) {
      filtered = filtered.filter(p => p.priority === priority);
    }
    if (managerId) {
      filtered = filtered.filter(p => p.managerId === managerId);
    }

    res.json({ projects: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * POST /api/erp/projects
 * Create a new project
 */
router.post('/projects',
  isAuthenticated,
  [
    body('name').notEmpty().withMessage('Project name is required'),
    body('budget').isNumeric().withMessage('Budget must be numeric'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').optional().isISO8601()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const project = {
        id: `proj_${Date.now()}`,
        ...req.body,
        status: 'planning',
        progress: 0,
        actualCost: 0,
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      projects.push(project);

      res.status(201).json({ message: 'Project created', project });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

/**
 * POST /api/erp/projects/:id/upload
 * Upload project documents (plans, reports, etc.)
 */
router.post('/projects/:id/upload',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const project = projects.find(p => p.id === id);

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
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
          category: 'erp',
          tags: ['project', id],
          description: req.body.description,
          relatedEntityType: 'project',
          relatedEntityId: id
        }
      );

      if (!project.documents) {
        project.documents = [];
      }
      project.documents.push({
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

// ============ RESOURCE MANAGEMENT ============

/**
 * GET /api/erp/resources
 * Get all resources
 */
router.get('/resources', isAuthenticated, async (req, res) => {
  try {
    const { type, status, projectId } = req.query;

    let filtered = [...resources];

    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }
    if (projectId) {
      filtered = filtered.filter(r => r.projectId === projectId);
    }

    res.json({ resources: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

/**
 * POST /api/erp/resources
 * Allocate resource
 */
router.post('/resources',
  isAuthenticated,
  [
    body('type').isIn(['human', 'equipment', 'material', 'financial']),
    body('name').notEmpty().withMessage('Resource name required'),
    body('projectId').optional().isString()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const resource = {
        id: `res_${Date.now()}`,
        ...req.body,
        status: 'available',
        allocatedAt: req.body.projectId ? new Date().toISOString() : null,
        createdBy: req.user?.id
      };

      resources.push(resource);

      res.status(201).json({ message: 'Resource allocated', resource });
    } catch (error) {
      console.error('Error allocating resource:', error);
      res.status(500).json({ error: 'Failed to allocate resource' });
    }
  }
);

// ============ FINANCIAL ACCOUNTS ============

/**
 * GET /api/erp/accounts
 * Get all accounts
 */
router.get('/accounts', isAuthenticated, async (req, res) => {
  try {
    const { type, status } = req.query;

    let filtered = [...accounts];

    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }

    res.json({ accounts: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

/**
 * POST /api/erp/accounts
 * Create financial account
 */
router.post('/accounts',
  isAuthenticated,
  requireAdmin,
  [
    body('name').notEmpty().withMessage('Account name required'),
    body('type').isIn(['asset', 'liability', 'equity', 'revenue', 'expense']),
    body('accountNumber').notEmpty().withMessage('Account number required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const account = {
        id: `acc_${Date.now()}`,
        ...req.body,
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      accounts.push(account);

      res.status(201).json({ message: 'Account created', account });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
);

// ============ BUDGETS ============

/**
 * GET /api/erp/budgets
 * Get all budgets
 */
router.get('/budgets', isAuthenticated, async (req, res) => {
  try {
    const { department, year, status } = req.query;

    let filtered = [...budgets];

    if (department) {
      filtered = filtered.filter(b => b.department === department);
    }
    if (year) {
      filtered = filtered.filter(b => b.year === Number(year));
    }
    if (status) {
      filtered = filtered.filter(b => b.status === status);
    }

    res.json({ budgets: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

/**
 * POST /api/erp/budgets
 * Create budget
 */
router.post('/budgets',
  isAuthenticated,
  requireAdmin,
  [
    body('department').notEmpty(),
    body('year').isInt({ min: 2020 }),
    body('allocated').isNumeric()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const budget = {
        id: `budget_${Date.now()}`,
        ...req.body,
        spent: 0,
        remaining: req.body.allocated,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      budgets.push(budget);

      res.status(201).json({ message: 'Budget created', budget });
    } catch (error) {
      console.error('Error creating budget:', error);
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
);

/**
 * POST /api/erp/budgets/import
 * Import budgets from Excel
 */
router.post('/budgets/import',
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
          category: 'erp',
          tags: ['budget', 'import', 'excel'],
          description: 'Budget import file'
        }
      );

      res.json({
        message: 'Budget file uploaded. Processing will complete shortly.',
        fileId: metadata.id
      });
    } catch (error) {
      console.error('Error importing budgets:', error);
      res.status(500).json({ error: 'Failed to import budgets' });
    }
  }
);

// ============ TRANSACTIONS ============

/**
 * GET /api/erp/transactions
 * Get all financial transactions
 */
router.get('/transactions', isAuthenticated, async (req, res) => {
  try {
    const { type, accountId, dateFrom, dateTo } = req.query;

    let filtered = [...transactions];

    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }
    if (accountId) {
      filtered = filtered.filter(t => t.accountId === accountId);
    }
    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateFrom as string));
    }
    if (dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateTo as string));
    }

    res.json({ transactions: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/erp/transactions
 * Record financial transaction
 */
router.post('/transactions',
  isAuthenticated,
  [
    body('type').isIn(['debit', 'credit']),
    body('accountId').notEmpty(),
    body('amount').isNumeric(),
    body('description').notEmpty()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const transaction = {
        id: `txn_${Date.now()}`,
        ...req.body,
        date: new Date().toISOString(),
        createdBy: req.user?.id,
        status: 'completed'
      };

      transactions.push(transaction);

      // Update account balance
      const account = accounts.find(a => a.id === req.body.accountId);
      if (account) {
        if (req.body.type === 'credit') {
          account.balance += Number(req.body.amount);
        } else {
          account.balance -= Number(req.body.amount);
        }
      }

      res.status(201).json({ message: 'Transaction recorded', transaction });
    } catch (error) {
      console.error('Error recording transaction:', error);
      res.status(500).json({ error: 'Failed to record transaction' });
    }
  }
);

// ============ PURCHASE ORDERS ============

/**
 * GET /api/erp/purchase-orders
 * Get all purchase orders
 */
router.get('/purchase-orders', isAuthenticated, async (req, res) => {
  try {
    const { status, supplierId } = req.query;

    let filtered = [...purchaseOrders];

    if (status) {
      filtered = filtered.filter(po => po.status === status);
    }
    if (supplierId) {
      filtered = filtered.filter(po => po.supplierId === supplierId);
    }

    res.json({ purchaseOrders: filtered, total: filtered.length });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

/**
 * POST /api/erp/purchase-orders
 * Create purchase order
 */
router.post('/purchase-orders',
  isAuthenticated,
  [
    body('supplierId').notEmpty(),
    body('items').isArray(),
    body('totalAmount').isNumeric()
  ],
  handleValidation,
  async (req, res) => {
    try {
      const po = {
        id: `po_${Date.now()}`,
        poNumber: `PO-${Date.now()}`,
        ...req.body,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: req.user?.id
      };

      purchaseOrders.push(po);

      res.status(201).json({ message: 'Purchase order created', purchaseOrder: po });
    } catch (error) {
      console.error('Error creating purchase order:', error);
      res.status(500).json({ error: 'Failed to create purchase order' });
    }
  }
);

/**
 * POST /api/erp/purchase-orders/:id/upload
 * Upload PO document
 */
router.post('/purchase-orders/:id/upload',
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const po = purchaseOrders.find(p => p.id === id);

      if (!po) {
        return res.status(404).json({ error: 'Purchase order not found' });
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
          category: 'erp',
          tags: ['purchase-order', id],
          description: req.body.description,
          relatedEntityType: 'purchase_order',
          relatedEntityId: id
        }
      );

      if (!po.documents) {
        po.documents = [];
      }
      po.documents.push({
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

// ============ ANALYTICS ============

/**
 * GET /api/erp/analytics/dashboard
 * Get ERP dashboard analytics
 */
router.get('/analytics/dashboard', isAuthenticated, async (req, res) => {
  try {
    const analytics = {
      inventory: {
        total: inventory.length,
        lowStock: inventory.filter(i => i.quantity <= i.reorderLevel).length,
        totalValue: inventory.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0)
      },
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'in_progress').length,
        completed: projects.filter(p => p.status === 'completed').length,
        totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        totalSpent: projects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
      },
      financial: {
        totalRevenue: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
        totalExpenses: transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
        netIncome: transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
      },
      purchaseOrders: {
        total: purchaseOrders.length,
        pending: purchaseOrders.filter(po => po.status === 'pending').length,
        completed: purchaseOrders.filter(po => po.status === 'completed').length,
        totalValue: purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0)
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching ERP analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
