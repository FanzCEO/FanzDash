/**
 * FANZ Template Management Routes
 * API endpoints for template rendering and management
 */

import { Router, Request, Response } from 'express';
import { templateService } from '../templates/TemplateService';
import { requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * Get all available templates
 * GET /api/templates
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const templates = await templateService.getTemplatesList(category as string);

    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get template metadata
 * GET /api/templates/:category/:name/metadata
 */
router.get('/:category/:name/metadata', async (req: Request, res: Response) => {
  try {
    const { category, name } = req.params;
    const templatePath = `${category}/${name}`;

    const metadata = await templateService.getTemplateMetadata(templatePath);

    res.json({
      success: true,
      metadata
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render a template with provided variables
 * POST /api/templates/render
 */
router.post('/render', async (req: Request, res: Response) => {
  try {
    const { templatePath, variables, format = 'html' } = req.body;

    if (!templatePath) {
      return res.status(400).json({
        success: false,
        error: 'templatePath is required'
      });
    }

    if (!variables) {
      return res.status(400).json({
        success: false,
        error: 'variables are required'
      });
    }

    // Validate variables first
    const validation = await templateService.validateTemplate(templatePath, variables);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Missing required variables',
        missing: validation.missing
      });
    }

    const rendered = await templateService.renderTemplate(templatePath, variables);

    if (format === 'html') {
      res.setHeader('Content-Type', 'text/html');
      res.send(rendered);
    } else {
      res.json({
        success: true,
        rendered
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render invoice
 * POST /api/templates/invoice
 */
router.post('/invoice', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;

    const rendered = await templateService.renderInvoice(variables || templateService.getSampleInvoiceData());

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render payout statement
 * POST /api/templates/payout-statement
 */
router.post('/payout-statement', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;

    const rendered = await templateService.renderPayoutStatement(variables || templateService.getSamplePayoutData());

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render welcome email
 * POST /api/templates/email/welcome
 */
router.post('/email/welcome', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;

    if (!variables || !variables.creator || !variables.dashboardUrl) {
      return res.status(400).json({
        success: false,
        error: 'Required variables: creator.name, dashboardUrl'
      });
    }

    const rendered = await templateService.renderWelcomeEmail(variables);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render SMS template
 * POST /api/templates/sms/:templateName
 */
router.post('/sms/:templateName', async (req: Request, res: Response) => {
  try {
    const { templateName } = req.params;
    const { variables } = req.body;

    if (!variables) {
      return res.status(400).json({
        success: false,
        error: 'variables are required'
      });
    }

    const rendered = await templateService.renderSMS(templateName, variables);

    res.json({
      success: true,
      sms: rendered
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Preview sample invoice
 * GET /api/templates/preview/invoice
 */
router.get('/preview/invoice', async (req: Request, res: Response) => {
  try {
    const sampleData = templateService.getSampleInvoiceData();
    const rendered = await templateService.renderInvoice(sampleData);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Preview sample payout statement
 * GET /api/templates/preview/payout
 */
router.get('/preview/payout', async (req: Request, res: Response) => {
  try {
    const sampleData = templateService.getSamplePayoutData();
    const rendered = await templateService.renderPayoutStatement(sampleData);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Clear template cache
 * POST /api/templates/cache/clear
 */
router.post('/cache/clear', requireAdmin, (req: Request, res: Response) => {
  try {
    templateService.clearCache();

    res.json({
      success: true,
      message: 'Template cache cleared successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// WORKFLOW TEMPLATE ROUTES
// ============================================

/**
 * Render content creation workflow
 * POST /api/templates/workflow/content-creation
 */
router.post('/workflow/content-creation', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;
    const rendered = await templateService.renderContentCreationWorkflow(variables);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render creator onboarding workflow
 * POST /api/templates/workflow/onboarding
 */
router.post('/workflow/onboarding', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;
    const rendered = await templateService.renderCreatorOnboardingWorkflow(variables);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render content approval workflow
 * POST /api/templates/workflow/approval
 */
router.post('/workflow/approval', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;
    const rendered = await templateService.renderContentApprovalWorkflow(variables);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render payout request workflow
 * POST /api/templates/workflow/payout
 */
router.post('/workflow/payout', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;
    const rendered = await templateService.renderPayoutRequestWorkflow(variables);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render marketing campaign workflow
 * POST /api/templates/workflow/marketing
 */
router.post('/workflow/marketing', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;
    const rendered = await templateService.renderMarketingCampaignWorkflow(variables);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render collaboration agreement workflow
 * POST /api/templates/workflow/collaboration
 */
router.post('/workflow/collaboration', async (req: Request, res: Response) => {
  try {
    const { variables } = req.body;
    const rendered = await templateService.renderCollaborationAgreementWorkflow(variables);

    res.setHeader('Content-Type', 'text/html');
    res.send(rendered);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
