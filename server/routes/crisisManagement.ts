/**
 * FANZ Crisis Management API Routes
 * Command center, active crises, threat alerts, and response plans
 */

import { Router, Request, Response } from 'express';
import { commandCenter } from '../crisis/CommandCenterService';
import { getAllResponsePlans, getResponsePlan } from '../crisis/ResponsePlans';
import { CrisisType, SeverityLevel, CrisisStatus } from '../crisis/CrisisTypes';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// ============================================
// COMMAND CENTER DASHBOARD
// ============================================

/**
 * Get command center overview
 * GET /api/crisis/command-center
 */
router.get('/command-center', requireAdmin, (req: Request, res: Response) => {
  try {
    const data = commandCenter.getCommandCenterData();

    res.json({
      success: true,
      commandCenter: data
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ACTIVE CRISES
// ============================================

/**
 * Get all active crises
 * GET /api/crisis/active
 */
router.get('/active', requireAdmin, (req: Request, res: Response) => {
  try {
    const crises = commandCenter.getActiveCrises();

    res.json({
      success: true,
      count: crises.length,
      crises
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get crisis by ID
 * GET /api/crisis/:id
 */
router.get('/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const crisis = commandCenter.getCrisis(id);

    if (!crisis) {
      return res.status(404).json({
        success: false,
        error: 'Crisis not found'
      });
    }

    res.json({
      success: true,
      crisis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Declare new crisis
 * POST /api/crisis/declare
 */
router.post('/declare', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      type,
      severity,
      title,
      description,
      detectedBy,
      impact
    } = req.body;

    if (!type || !severity || !title || !description || !detectedBy || !impact) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const crisis = commandCenter.declareCrisis({
      type: type as CrisisType,
      severity: severity as SeverityLevel,
      title,
      description,
      detectedBy,
      impact
    });

    res.json({
      success: true,
      message: 'Crisis declared',
      crisis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update crisis status
 * PUT /api/crisis/:id/status
 */
router.put('/:id/status', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actor } = req.body;

    if (!status || !actor) {
      return res.status(400).json({
        success: false,
        error: 'Missing status or actor'
      });
    }

    const crisis = commandCenter.updateCrisisStatus(
      id,
      status as CrisisStatus,
      actor
    );

    if (!crisis) {
      return res.status(404).json({
        success: false,
        error: 'Crisis not found'
      });
    }

    res.json({
      success: true,
      message: 'Crisis status updated',
      crisis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// THREAT ALERTS
// ============================================

/**
 * Get all threat alerts
 * GET /api/crisis/alerts
 */
router.get('/alerts/list', requireAdmin, (req: Request, res: Response) => {
  try {
    const alerts = commandCenter.getThreatAlerts();

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create threat alert
 * POST /api/crisis/alerts
 */
router.post('/alerts', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      alertType,
      severity,
      title,
      description,
      source,
      indicators,
      affectedSystems,
      potentialImpact,
      confidence
    } = req.body;

    if (!alertType || !severity || !title || !description || !source) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const alert = commandCenter.createThreatAlert({
      alertType,
      severity: severity as SeverityLevel,
      title,
      description,
      source,
      indicators: indicators || [],
      affectedSystems: affectedSystems || [],
      potentialImpact: potentialImpact || 'Unknown',
      confidence: confidence || 'medium'
    });

    res.json({
      success: true,
      message: 'Threat alert created',
      alert
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Escalate alert to crisis
 * POST /api/crisis/alerts/:id/escalate
 */
router.post('/alerts/:id/escalate', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actor } = req.body;

    if (!actor) {
      return res.status(400).json({
        success: false,
        error: 'Missing actor'
      });
    }

    const crisis = commandCenter.escalateToCrisis(id, actor);

    if (!crisis) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert escalated to crisis',
      crisis
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// RESPONSE PLANS
// ============================================

/**
 * Get all response plans
 * GET /api/crisis/response-plans
 */
router.get('/response-plans', requireAdmin, (req: Request, res: Response) => {
  try {
    const plans = getAllResponsePlans();

    res.json({
      success: true,
      count: plans.length,
      responsePlans: plans
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get response plan by crisis type
 * GET /api/crisis/response-plans/:crisisType
 */
router.get('/response-plans/:crisisType', requireAdmin, (req: Request, res: Response) => {
  try {
    const { crisisType } = req.params;
    const plan = getResponsePlan(crisisType as CrisisType);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Response plan not found for this crisis type'
      });
    }

    res.json({
      success: true,
      responsePlan: plan
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// CRISIS STATISTICS & METRICS
// ============================================

/**
 * Get crisis statistics
 * GET /api/crisis/stats
 */
router.get('/stats/overview', requireAdmin, (req: Request, res: Response) => {
  try {
    const crises = commandCenter.getActiveCrises();
    const alerts = commandCenter.getThreatAlerts();

    const stats = {
      activeCrises: crises.length,
      criticalCrises: crises.filter(c => c.severity === SeverityLevel.CRITICAL).length,
      highSeverityCrises: crises.filter(c => c.severity === SeverityLevel.HIGH).length,
      activeAlerts: alerts.filter(a => a.status === 'new' || a.status === 'investigating').length,
      crisesByType: this.groupByType(crises),
      crisesByStatus: this.groupByStatus(crises),
      avgResolutionTime: this.calculateAvgResolutionTime(crises),
      executiveNotifications: crises.filter(c => c.executiveNotified).length
    };

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }

  function groupByType(crises: any[]) {
    const groups: Record<string, number> = {};
    for (const crisis of crises) {
      groups[crisis.type] = (groups[crisis.type] || 0) + 1;
    }
    return groups;
  }

  function groupByStatus(crises: any[]) {
    const groups: Record<string, number> = {};
    for (const crisis of crises) {
      groups[crisis.status] = (groups[crisis.status] || 0) + 1;
    }
    return groups;
  }

  function calculateAvgResolutionTime(crises: any[]): number | null {
    const resolved = crises.filter(c => c.resolvedAt);
    if (resolved.length === 0) return null;

    const totalMinutes = resolved.reduce((sum, crisis) => {
      const minutes = (crisis.resolvedAt.getTime() - crisis.detectedAt.getTime()) / 60000;
      return sum + minutes;
    }, 0);

    return Math.round(totalMinutes / resolved.length);
  }
});

export default router;
