import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { isAuthenticated, requireAdmin, requireModerator } from '../middleware/auth';
import { complianceManager } from '../hr/ComplianceManager';
import { policySearchSystem } from '../hr/PolicySearchSystem';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting
const complianceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

// ============ COMPLIANCE REQUIREMENTS ============

/**
 * GET /api/hr-compliance/requirements
 * Get all compliance requirements
 */
router.get('/requirements', isAuthenticated, complianceLimiter, async (req, res) => {
  try {
    const { jurisdiction, category, critical } = req.query;

    let requirements = complianceManager.getAllRequirements();

    if (jurisdiction) {
      requirements = complianceManager.getRequirementsByJurisdiction(jurisdiction as any);
    }

    if (category) {
      requirements = complianceManager.getRequirementsByCategory(category as any);
    }

    if (critical === 'true') {
      requirements = complianceManager.getCriticalRequirements();
    }

    res.json({
      requirements,
      total: requirements.length
    });
  } catch (error) {
    console.error('Error fetching compliance requirements:', error);
    res.status(500).json({ error: 'Failed to fetch compliance requirements' });
  }
});

/**
 * GET /api/hr-compliance/requirements/:id
 * Get specific compliance requirement
 */
router.get('/requirements/:id',
  isAuthenticated,
  param('id').isString(),
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const requirements = complianceManager.getAllRequirements();
      const requirement = requirements.find(r => r.id === id);

      if (!requirement) {
        return res.status(404).json({ error: 'Requirement not found' });
      }

      res.json(requirement);
    } catch (error) {
      console.error('Error fetching requirement:', error);
      res.status(500).json({ error: 'Failed to fetch requirement' });
    }
  }
);

/**
 * GET /api/hr-compliance/dashboard
 * Get compliance dashboard
 */
router.get('/dashboard', isAuthenticated, requireModerator, async (req, res) => {
  try {
    const dashboard = complianceManager.getComplianceDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching compliance dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

/**
 * POST /api/hr-compliance/violations
 * Record a compliance violation
 */
router.post('/violations',
  isAuthenticated,
  requireModerator,
  [
    body('requirementId').notEmpty().withMessage('Requirement ID is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('severity').isIn(['critical', 'major', 'minor']).withMessage('Valid severity required'),
    body('remediation').notEmpty().withMessage('Remediation plan is required'),
    body('remediationDeadline').isISO8601().withMessage('Valid deadline date required'),
    body('assignedTo').notEmpty().withMessage('Assignment is required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const violationData = {
        requirementId: req.body.requirementId,
        date: new Date(),
        description: req.body.description,
        severity: req.body.severity,
        remediation: req.body.remediation,
        remediationDeadline: new Date(req.body.remediationDeadline),
        status: 'open' as const,
        reportedBy: req.user?.id || 'unknown',
        assignedTo: req.body.assignedTo
      };

      const violationId = complianceManager.recordViolation(violationData);

      res.status(201).json({
        message: 'Compliance violation recorded',
        violationId
      });
    } catch (error) {
      console.error('Error recording violation:', error);
      res.status(500).json({ error: 'Failed to record violation' });
    }
  }
);

/**
 * PATCH /api/hr-compliance/violations/:id/resolve
 * Resolve a compliance violation
 */
router.patch('/violations/:id/resolve',
  isAuthenticated,
  requireModerator,
  [
    param('id').isString(),
    body('resolutionNotes').notEmpty().withMessage('Resolution notes required')
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;

      const success = complianceManager.resolveViolation(id, resolutionNotes);

      if (!success) {
        return res.status(404).json({ error: 'Violation not found' });
      }

      res.json({ message: 'Violation resolved successfully' });
    } catch (error) {
      console.error('Error resolving violation:', error);
      res.status(500).json({ error: 'Failed to resolve violation' });
    }
  }
);

// ============ POLICY MANAGEMENT ============

/**
 * GET /api/hr-compliance/policies
 * Get all policies
 */
router.get('/policies', isAuthenticated, async (req, res) => {
  try {
    const policies = complianceManager.getAllPolicies();

    // Convert Set to Array for JSON serialization
    const serializedPolicies = policies.map(p => ({
      ...p,
      acknowledgedBy: Array.from(p.acknowledgedBy)
    }));

    res.json({
      policies: serializedPolicies,
      total: policies.length
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

/**
 * GET /api/hr-compliance/policies/:id
 * Get specific policy
 */
router.get('/policies/:id',
  isAuthenticated,
  param('id').isString(),
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const policies = complianceManager.getAllPolicies();
      const policy = policies.find(p => p.id === id);

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      res.json({
        ...policy,
        acknowledgedBy: Array.from(policy.acknowledgedBy)
      });
    } catch (error) {
      console.error('Error fetching policy:', error);
      res.status(500).json({ error: 'Failed to fetch policy' });
    }
  }
);

/**
 * POST /api/hr-compliance/policies/:id/acknowledge
 * Acknowledge a policy
 */
router.post('/policies/:id/acknowledge',
  isAuthenticated,
  param('id').isString(),
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const employeeId = req.user?.id || 'unknown';

      const success = complianceManager.acknowledgePolicy(id, employeeId);

      if (!success) {
        return res.status(404).json({ error: 'Policy not found' });
      }

      res.json({ message: 'Policy acknowledged successfully' });
    } catch (error) {
      console.error('Error acknowledging policy:', error);
      res.status(500).json({ error: 'Failed to acknowledge policy' });
    }
  }
);

// ============ POLICY SEARCH ============

/**
 * GET /api/hr-compliance/policies/search
 * Search policies
 */
router.get('/policies/search', isAuthenticated, async (req, res) => {
  try {
    const { q, category, legal_ref, keyword } = req.query;

    let results;

    if (q) {
      // Full-text search
      const filters: any = {};
      if (category) filters.categories = [category as string];

      results = policySearchSystem.search(q as string, filters);
    } else if (category) {
      // Category search
      const sections = policySearchSystem.searchByCategory(category as string);
      results = sections.map(section => ({
        section,
        relevance: 1,
        matchedTerms: [],
        snippet: '',
        highlights: []
      }));
    } else if (legal_ref) {
      // Legal reference search
      const sections = policySearchSystem.searchByLegalReference(legal_ref as string);
      results = sections.map(section => ({
        section,
        relevance: 1,
        matchedTerms: [],
        snippet: '',
        highlights: []
      }));
    } else if (keyword) {
      // Keyword search
      const sections = policySearchSystem.searchByKeyword(keyword as string);
      results = sections.map(section => ({
        section,
        relevance: 1,
        matchedTerms: [],
        snippet: '',
        highlights: []
      }));
    } else {
      // No search criteria, return all
      const sections = policySearchSystem.getAllSections();
      results = sections.map(section => ({
        section,
        relevance: 1,
        matchedTerms: [],
        snippet: '',
        highlights: []
      }));
    }

    res.json({
      results,
      total: results.length
    });
  } catch (error) {
    console.error('Error searching policies:', error);
    res.status(500).json({ error: 'Failed to search policies' });
  }
});

/**
 * GET /api/hr-compliance/policies/:id/related
 * Get related policies
 */
router.get('/policies/:id/related',
  isAuthenticated,
  param('id').isString(),
  handleValidation,
  async (req, res) => {
    try {
      const { id } = req.params;
      const related = policySearchSystem.getRelatedPolicies(id);

      res.json({
        related,
        total: related.length
      });
    } catch (error) {
      console.error('Error fetching related policies:', error);
      res.status(500).json({ error: 'Failed to fetch related policies' });
    }
  }
);

/**
 * GET /api/hr-compliance/faqs/search
 * Search FAQs
 */
router.get('/faqs/search', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const results = policySearchSystem.searchFAQs(q as string);

    res.json({
      results,
      total: results.length
    });
  } catch (error) {
    console.error('Error searching FAQs:', error);
    res.status(500).json({ error: 'Failed to search FAQs' });
  }
});

/**
 * GET /api/hr-compliance/table-of-contents
 * Get policy table of contents
 */
router.get('/table-of-contents', isAuthenticated, async (req, res) => {
  try {
    const toc = policySearchSystem.getTableOfContents();
    res.json(toc);
  } catch (error) {
    console.error('Error fetching TOC:', error);
    res.status(500).json({ error: 'Failed to fetch table of contents' });
  }
});

/**
 * GET /api/hr-compliance/categories
 * Get all policy categories
 */
router.get('/categories', isAuthenticated, async (req, res) => {
  try {
    const categories = policySearchSystem.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/hr-compliance/legal-references
 * Get all legal references
 */
router.get('/legal-references', isAuthenticated, async (req, res) => {
  try {
    const references = policySearchSystem.getAllLegalReferences();
    res.json({ references });
  } catch (error) {
    console.error('Error fetching legal references:', error);
    res.status(500).json({ error: 'Failed to fetch legal references' });
  }
});

/**
 * GET /api/hr-compliance/suggest
 * Auto-suggest for search
 */
router.get('/suggest', isAuthenticated, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const suggestions = policySearchSystem.autoSuggest(q as string, Number(limit));

    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

// ============ ANALYTICS ============

/**
 * GET /api/hr-compliance/analytics/compliance-rate
 * Get compliance rate over time
 */
router.get('/analytics/compliance-rate', isAuthenticated, requireModerator, async (req, res) => {
  try {
    const dashboard = complianceManager.getComplianceDashboard();

    res.json({
      complianceRate: dashboard.overview.complianceRate,
      breakdown: {
        compliant: dashboard.overview.compliant,
        warnings: dashboard.overview.warnings,
        violations: dashboard.overview.violations
      }
    });
  } catch (error) {
    console.error('Error fetching compliance rate:', error);
    res.status(500).json({ error: 'Failed to fetch compliance rate' });
  }
});

/**
 * GET /api/hr-compliance/analytics/by-jurisdiction
 * Get compliance statistics by jurisdiction
 */
router.get('/analytics/by-jurisdiction', isAuthenticated, requireModerator, async (req, res) => {
  try {
    const dashboard = complianceManager.getComplianceDashboard();

    res.json(dashboard.byJurisdiction);
  } catch (error) {
    console.error('Error fetching jurisdiction analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
