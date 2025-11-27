/**
 * FANZ Access Management API Routes
 * Endpoints for managing access profiles, job templates, onboarding, and team invitations
 */

import { Router, Request, Response } from 'express';
import {
  ACCESS_PROFILES,
  getAccessProfile,
  getAccessProfilesByDepartment,
  getAllDepartments,
  getAllJobTitles,
  hasPermission,
  Permission
} from '../access/AccessProfiles';
import {
  JOB_TEMPLATES,
  getJobTemplate,
  getJobTemplatesByDepartment,
  getJobTemplatesByLevel,
  getJobAccessProfile
} from '../access/JobDescriptionTemplates';
import {
  ONBOARDING_TEMPLATES,
  getOnboardingTemplate,
  getOnboardingTemplateByJob,
  getTasksByDay,
  getTasksByCategory
} from '../access/OnboardingTemplates';
import {
  INVITATION_TEMPLATES,
  createTeamInvitation,
  renderInvitationEmail,
  createBulkInvitations
} from '../access/TeamInvitationTemplates';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// ============================================
// ACCESS PROFILES
// ============================================

/**
 * Get all access profiles
 * GET /api/access/profiles
 */
router.get('/profiles', requireAdmin, (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: Object.keys(ACCESS_PROFILES).length,
      profiles: Object.values(ACCESS_PROFILES)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get access profile by ID
 * GET /api/access/profiles/:id
 */
router.get('/profiles/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = getAccessProfile(id.toUpperCase());

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Access profile not found'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get access profiles by department
 * GET /api/access/profiles/department/:department
 */
router.get('/profiles/department/:department', requireAdmin, (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const profiles = getAccessProfilesByDepartment(department);

    res.json({
      success: true,
      department,
      count: profiles.length,
      profiles
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all departments
 * GET /api/access/departments
 */
router.get('/departments', requireAdmin, (req: Request, res: Response) => {
  try {
    const departments = getAllDepartments();

    res.json({
      success: true,
      count: departments.length,
      departments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all job titles
 * GET /api/access/job-titles
 */
router.get('/job-titles', requireAdmin, (req: Request, res: Response) => {
  try {
    const jobTitles = getAllJobTitles();

    res.json({
      success: true,
      count: jobTitles.length,
      jobTitles
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// JOB TEMPLATES
// ============================================

/**
 * Get all job templates
 * GET /api/access/jobs
 */
router.get('/jobs', requireAdmin, (req: Request, res: Response) => {
  try {
    const { department, level } = req.query;

    let jobs = Object.values(JOB_TEMPLATES);

    if (department) {
      jobs = jobs.filter(job => job.department === department);
    }

    if (level) {
      jobs = jobs.filter(job => job.level === level);
    }

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get job template by ID
 * GET /api/access/jobs/:id
 */
router.get('/jobs/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = getJobTemplate(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job template not found'
      });
    }

    // Also include the access profile
    const accessProfile = getJobAccessProfile(id);

    res.json({
      success: true,
      job,
      accessProfile
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get jobs by department
 * GET /api/access/jobs/department/:department
 */
router.get('/jobs/department/:department', requireAdmin, (req: Request, res: Response) => {
  try {
    const { department } = req.params;
    const jobs = getJobTemplatesByDepartment(department);

    res.json({
      success: true,
      department,
      count: jobs.length,
      jobs
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ONBOARDING TEMPLATES
// ============================================

/**
 * Get all onboarding templates
 * GET /api/access/onboarding
 */
router.get('/onboarding', requireAdmin, (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: Object.keys(ONBOARDING_TEMPLATES).length,
      templates: Object.values(ONBOARDING_TEMPLATES)
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get onboarding template by ID
 * GET /api/access/onboarding/:id
 */
router.get('/onboarding/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = getOnboardingTemplate(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get onboarding template by job title
 * GET /api/access/onboarding/job/:jobTitle
 */
router.get('/onboarding/job/:jobTitle', requireAdmin, (req: Request, res: Response) => {
  try {
    const { jobTitle } = req.params;
    const template = getOnboardingTemplateByJob(jobTitle);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding template not found for this job title'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get tasks for specific day
 * GET /api/access/onboarding/:id/day/:day
 */
router.get('/onboarding/:id/day/:day', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id, day } = req.params;
    const template = getOnboardingTemplate(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding template not found'
      });
    }

    const tasks = getTasksByDay(template, parseInt(day));

    res.json({
      success: true,
      day: parseInt(day),
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// TEAM INVITATIONS
// ============================================

/**
 * Get invitation templates
 * GET /api/access/invitations/templates
 */
router.get('/invitations/templates', requireAdmin, (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: Object.keys(INVITATION_TEMPLATES).length,
      templates: INVITATION_TEMPLATES
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create team invitation
 * POST /api/access/invitations
 */
router.post('/invitations', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      recipientEmail,
      recipientName,
      jobTitle,
      department,
      accessProfileId,
      startDate,
      invitedBy,
      templateType,
      personalizedMessage,
      onboardingTemplateId,
      buddyEmail
    } = req.body;

    if (!recipientEmail || !recipientName || !jobTitle || !department || !accessProfileId || !startDate || !invitedBy || !templateType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const invitation = createTeamInvitation({
      recipientEmail,
      recipientName,
      jobTitle,
      department,
      accessProfileId,
      startDate,
      invitedBy,
      templateType,
      personalizedMessage,
      onboardingTemplateId,
      buddyEmail
    });

    res.json({
      success: true,
      invitation
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Render invitation email
 * POST /api/access/invitations/render
 */
router.post('/invitations/render', requireAdmin, (req: Request, res: Response) => {
  try {
    const { invitation, templateType, variables } = req.body;

    if (!invitation || !templateType) {
      return res.status(400).json({
        success: false,
        error: 'Missing invitation or templateType'
      });
    }

    const email = renderInvitationEmail(invitation, templateType, variables || {});

    res.json({
      success: true,
      email
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create bulk invitations
 * POST /api/access/invitations/bulk
 */
router.post('/invitations/bulk', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      templateType,
      invitations,
      department,
      accessProfileId,
      invitedBy
    } = req.body;

    if (!templateType || !invitations || !department || !accessProfileId || !invitedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for bulk invitation'
      });
    }

    const bulkInvitations = createBulkInvitations({
      templateType,
      invitations,
      department,
      accessProfileId,
      invitedBy
    });

    res.json({
      success: true,
      count: bulkInvitations.length,
      invitations: bulkInvitations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Quick new hire setup - combines job, access, and onboarding
 * POST /api/access/quick-hire
 */
router.post('/quick-hire', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      recipientEmail,
      recipientName,
      jobId,
      startDate,
      invitedBy,
      buddyEmail
    } = req.body;

    if (!recipientEmail || !recipientName || !jobId || !startDate || !invitedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Get job template
    const job = getJobTemplate(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job template not found'
      });
    }

    // Get access profile
    const accessProfile = getJobAccessProfile(jobId);
    if (!accessProfile) {
      return res.status(404).json({
        success: false,
        error: 'Access profile not found for this job'
      });
    }

    // Get onboarding template
    const onboardingTemplate = getOnboardingTemplateByJob(job.jobTitle);

    // Determine invitation template type based on job level
    let templateType: keyof typeof INVITATION_TEMPLATES;
    switch (job.level) {
      case 'executive':
        templateType = 'EXECUTIVE';
        break;
      case 'lead':
      case 'senior':
        templateType = 'MANAGEMENT';
        break;
      default:
        templateType = 'INDIVIDUAL_CONTRIBUTOR';
    }

    // Create invitation
    const invitation = createTeamInvitation({
      recipientEmail,
      recipientName,
      jobTitle: job.title,
      department: job.department,
      accessProfileId: job.accessProfile,
      startDate,
      invitedBy,
      templateType,
      onboardingTemplateId: onboardingTemplate?.id,
      buddyEmail
    });

    res.json({
      success: true,
      message: 'Quick hire setup complete',
      data: {
        job,
        accessProfile,
        onboardingTemplate,
        invitation
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
