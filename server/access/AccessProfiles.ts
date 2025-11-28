/**
 * FANZ Delegative Access Profiles
 * Role-based access control profiles for quick assignment to new hires
 */

export enum Permission {
  // Platform Management
  PLATFORM_VIEW = 'platform:view',
  PLATFORM_EDIT = 'platform:edit',
  PLATFORM_DELETE = 'platform:delete',
  PLATFORM_CREATE = 'platform:create',

  // Creator Management
  CREATOR_VIEW = 'creator:view',
  CREATOR_EDIT = 'creator:edit',
  CREATOR_VERIFY = 'creator:verify',
  CREATOR_SUSPEND = 'creator:suspend',
  CREATOR_DELETE = 'creator:delete',

  // Content Management
  CONTENT_VIEW = 'content:view',
  CONTENT_APPROVE = 'content:approve',
  CONTENT_REJECT = 'content:reject',
  CONTENT_DELETE = 'content:delete',
  CONTENT_FLAG = 'content:flag',

  // Financial Operations
  FINANCE_VIEW_EARNINGS = 'finance:view_earnings',
  FINANCE_PROCESS_PAYOUTS = 'finance:process_payouts',
  FINANCE_VIEW_REPORTS = 'finance:view_reports',
  FINANCE_MANAGE_FEES = 'finance:manage_fees',
  FINANCE_REFUNDS = 'finance:refunds',

  // Compliance & Legal
  COMPLIANCE_VIEW = 'compliance:view',
  COMPLIANCE_REVIEW = 'compliance:review',
  COMPLIANCE_2257 = 'compliance:2257',
  COMPLIANCE_AGE_VERIFY = 'compliance:age_verify',
  COMPLIANCE_LEGAL_HOLD = 'compliance:legal_hold',

  // Analytics & Reporting
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  ANALYTICS_ADMIN = 'analytics:admin',

  // Support Operations
  SUPPORT_VIEW_TICKETS = 'support:view_tickets',
  SUPPORT_RESPOND = 'support:respond',
  SUPPORT_ESCALATE = 'support:escalate',
  SUPPORT_CLOSE = 'support:close',

  // Marketing
  MARKETING_CAMPAIGNS = 'marketing:campaigns',
  MARKETING_EMAIL = 'marketing:email',
  MARKETING_ANALYTICS = 'marketing:analytics',

  // User Management
  USER_VIEW = 'user:view',
  USER_EDIT = 'user:edit',
  USER_CREATE = 'user:create',
  USER_DELETE = 'user:delete',
  USER_ROLES = 'user:roles',

  // System Administration
  ADMIN_SETTINGS = 'admin:settings',
  ADMIN_AUDIT_LOGS = 'admin:audit_logs',
  ADMIN_SYSTEM_CONFIG = 'admin:system_config',
  ADMIN_SUPER = 'admin:super',
}

export interface AccessProfile {
  id: string;
  name: string;
  description: string;
  department: string;
  jobTitle: string;
  permissions: Permission[];
  dashboardAccess: string[];
  dataAccessLevel: 'full' | 'department' | 'team' | 'own';
  canDelegate: boolean;
  maxDelegationLevel: number;
  reportingTo?: string;
  requiresTwoFactor: boolean;
  sessionTimeout: number; // in minutes
  allowedIPRanges?: string[];
  workingHours?: {
    timezone: string;
    schedule: string;
  };
}

/**
 * Pre-configured access profiles for common roles
 */
export const ACCESS_PROFILES: Record<string, AccessProfile> = {
  // ============================================
  // EXECUTIVE LEVEL
  // ============================================

  CEO: {
    id: 'ceo',
    name: 'Chief Executive Officer',
    description: 'Full system access with all permissions',
    department: 'Executive',
    jobTitle: 'CEO',
    permissions: Object.values(Permission),
    dashboardAccess: ['*'],
    dataAccessLevel: 'full',
    canDelegate: true,
    maxDelegationLevel: 10,
    requiresTwoFactor: true,
    sessionTimeout: 480, // 8 hours
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: '24/7'
    }
  },

  CTO: {
    id: 'cto',
    name: 'Chief Technology Officer',
    description: 'Full technical and system administration access',
    department: 'Technology',
    jobTitle: 'CTO',
    permissions: [
      Permission.PLATFORM_VIEW,
      Permission.PLATFORM_EDIT,
      Permission.PLATFORM_CREATE,
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_EXPORT,
      Permission.ANALYTICS_ADMIN,
      Permission.ADMIN_SETTINGS,
      Permission.ADMIN_AUDIT_LOGS,
      Permission.ADMIN_SYSTEM_CONFIG,
      Permission.USER_VIEW,
      Permission.USER_EDIT,
      Permission.USER_CREATE,
      Permission.USER_ROLES,
      Permission.FINANCE_VIEW_REPORTS,
    ],
    dashboardAccess: ['admin', 'analytics', 'system-health', 'platform-management'],
    dataAccessLevel: 'full',
    canDelegate: true,
    maxDelegationLevel: 5,
    requiresTwoFactor: true,
    sessionTimeout: 480,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: '24/7'
    }
  },

  CFO: {
    id: 'cfo',
    name: 'Chief Financial Officer',
    description: 'Full financial operations and reporting access',
    department: 'Finance',
    jobTitle: 'CFO',
    permissions: [
      Permission.FINANCE_VIEW_EARNINGS,
      Permission.FINANCE_PROCESS_PAYOUTS,
      Permission.FINANCE_VIEW_REPORTS,
      Permission.FINANCE_MANAGE_FEES,
      Permission.FINANCE_REFUNDS,
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_EXPORT,
      Permission.CREATOR_VIEW,
      Permission.PLATFORM_VIEW,
      Permission.ADMIN_AUDIT_LOGS,
    ],
    dashboardAccess: ['finance', 'analytics', 'payouts', 'revenue-reports'],
    dataAccessLevel: 'full',
    canDelegate: true,
    maxDelegationLevel: 5,
    requiresTwoFactor: true,
    sessionTimeout: 480,
    workingHours: {
      timezone: 'America/New_York',
      schedule: 'Mon-Fri 8am-6pm'
    }
  },

  CCO: {
    id: 'cco',
    name: 'Chief Compliance Officer',
    description: 'Full compliance, legal, and regulatory access',
    department: 'Legal & Compliance',
    jobTitle: 'CCO',
    permissions: [
      Permission.COMPLIANCE_VIEW,
      Permission.COMPLIANCE_REVIEW,
      Permission.COMPLIANCE_2257,
      Permission.COMPLIANCE_AGE_VERIFY,
      Permission.COMPLIANCE_LEGAL_HOLD,
      Permission.CONTENT_VIEW,
      Permission.CONTENT_APPROVE,
      Permission.CONTENT_REJECT,
      Permission.CONTENT_DELETE,
      Permission.CREATOR_VIEW,
      Permission.CREATOR_VERIFY,
      Permission.CREATOR_SUSPEND,
      Permission.ADMIN_AUDIT_LOGS,
      Permission.ANALYTICS_VIEW,
    ],
    dashboardAccess: ['compliance', 'legal-hold', 'verification', 'content-review', 'audit-trail'],
    dataAccessLevel: 'full',
    canDelegate: true,
    maxDelegationLevel: 5,
    requiresTwoFactor: true,
    sessionTimeout: 480,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-5pm'
    }
  },

  // ============================================
  // COMPLIANCE & LEGAL TEAM
  // ============================================

  COMPLIANCE_MANAGER: {
    id: 'compliance-manager',
    name: 'Compliance Manager',
    description: 'Manages compliance team and reviews high-risk cases',
    department: 'Legal & Compliance',
    jobTitle: 'Compliance Manager',
    permissions: [
      Permission.COMPLIANCE_VIEW,
      Permission.COMPLIANCE_REVIEW,
      Permission.COMPLIANCE_2257,
      Permission.COMPLIANCE_AGE_VERIFY,
      Permission.CONTENT_VIEW,
      Permission.CONTENT_APPROVE,
      Permission.CONTENT_REJECT,
      Permission.CONTENT_FLAG,
      Permission.CREATOR_VIEW,
      Permission.CREATOR_VERIFY,
      Permission.CREATOR_SUSPEND,
      Permission.ANALYTICS_VIEW,
      Permission.USER_VIEW,
    ],
    dashboardAccess: ['compliance', 'verification', 'content-review'],
    dataAccessLevel: 'department',
    canDelegate: true,
    maxDelegationLevel: 3,
    reportingTo: 'CCO',
    requiresTwoFactor: true,
    sessionTimeout: 360,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-6pm'
    }
  },

  COMPLIANCE_OFFICER: {
    id: 'compliance-officer',
    name: 'Compliance Officer',
    description: 'Reviews creator verifications and content compliance',
    department: 'Legal & Compliance',
    jobTitle: 'Compliance Officer',
    permissions: [
      Permission.COMPLIANCE_VIEW,
      Permission.COMPLIANCE_REVIEW,
      Permission.COMPLIANCE_2257,
      Permission.COMPLIANCE_AGE_VERIFY,
      Permission.CONTENT_VIEW,
      Permission.CONTENT_APPROVE,
      Permission.CONTENT_REJECT,
      Permission.CONTENT_FLAG,
      Permission.CREATOR_VIEW,
      Permission.CREATOR_VERIFY,
    ],
    dashboardAccess: ['compliance', 'verification', 'content-review'],
    dataAccessLevel: 'team',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'COMPLIANCE_MANAGER',
    requiresTwoFactor: true,
    sessionTimeout: 240,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-6pm'
    }
  },

  CONTENT_MODERATOR: {
    id: 'content-moderator',
    name: 'Content Moderator',
    description: 'Reviews and moderates creator content for policy compliance',
    department: 'Legal & Compliance',
    jobTitle: 'Content Moderator',
    permissions: [
      Permission.CONTENT_VIEW,
      Permission.CONTENT_APPROVE,
      Permission.CONTENT_REJECT,
      Permission.CONTENT_FLAG,
      Permission.CREATOR_VIEW,
      Permission.COMPLIANCE_VIEW,
    ],
    dashboardAccess: ['content-review', 'compliance'],
    dataAccessLevel: 'own',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'COMPLIANCE_MANAGER',
    requiresTwoFactor: true,
    sessionTimeout: 240,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Shift-based 24/7'
    }
  },

  // ============================================
  // FINANCE TEAM
  // ============================================

  FINANCE_MANAGER: {
    id: 'finance-manager',
    name: 'Finance Manager',
    description: 'Manages finance team and oversees payout operations',
    department: 'Finance',
    jobTitle: 'Finance Manager',
    permissions: [
      Permission.FINANCE_VIEW_EARNINGS,
      Permission.FINANCE_PROCESS_PAYOUTS,
      Permission.FINANCE_VIEW_REPORTS,
      Permission.FINANCE_REFUNDS,
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_EXPORT,
      Permission.CREATOR_VIEW,
      Permission.USER_VIEW,
    ],
    dashboardAccess: ['finance', 'payouts', 'revenue-reports', 'analytics'],
    dataAccessLevel: 'department',
    canDelegate: true,
    maxDelegationLevel: 3,
    reportingTo: 'CFO',
    requiresTwoFactor: true,
    sessionTimeout: 360,
    workingHours: {
      timezone: 'America/New_York',
      schedule: 'Mon-Fri 8am-6pm'
    }
  },

  FINANCE_ANALYST: {
    id: 'finance-analyst',
    name: 'Finance Analyst',
    description: 'Processes payouts and generates financial reports',
    department: 'Finance',
    jobTitle: 'Finance Analyst',
    permissions: [
      Permission.FINANCE_VIEW_EARNINGS,
      Permission.FINANCE_PROCESS_PAYOUTS,
      Permission.FINANCE_VIEW_REPORTS,
      Permission.ANALYTICS_VIEW,
      Permission.CREATOR_VIEW,
    ],
    dashboardAccess: ['finance', 'payouts', 'revenue-reports'],
    dataAccessLevel: 'team',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'FINANCE_MANAGER',
    requiresTwoFactor: true,
    sessionTimeout: 240,
    workingHours: {
      timezone: 'America/New_York',
      schedule: 'Mon-Fri 9am-5pm'
    }
  },

  ACCOUNTANT: {
    id: 'accountant',
    name: 'Accountant',
    description: 'Reviews financial records and tax compliance',
    department: 'Finance',
    jobTitle: 'Accountant',
    permissions: [
      Permission.FINANCE_VIEW_EARNINGS,
      Permission.FINANCE_VIEW_REPORTS,
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_EXPORT,
      Permission.CREATOR_VIEW,
    ],
    dashboardAccess: ['finance', 'revenue-reports', 'analytics'],
    dataAccessLevel: 'department',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'FINANCE_MANAGER',
    requiresTwoFactor: true,
    sessionTimeout: 240,
    workingHours: {
      timezone: 'America/New_York',
      schedule: 'Mon-Fri 9am-5pm'
    }
  },

  // ============================================
  // CREATOR SUPPORT TEAM
  // ============================================

  SUPPORT_MANAGER: {
    id: 'support-manager',
    name: 'Creator Support Manager',
    description: 'Manages support team and handles escalations',
    department: 'Creator Support',
    jobTitle: 'Support Manager',
    permissions: [
      Permission.SUPPORT_VIEW_TICKETS,
      Permission.SUPPORT_RESPOND,
      Permission.SUPPORT_ESCALATE,
      Permission.SUPPORT_CLOSE,
      Permission.CREATOR_VIEW,
      Permission.CREATOR_EDIT,
      Permission.CONTENT_VIEW,
      Permission.FINANCE_VIEW_EARNINGS,
      Permission.ANALYTICS_VIEW,
      Permission.USER_VIEW,
    ],
    dashboardAccess: ['support', 'creator-management', 'analytics'],
    dataAccessLevel: 'department',
    canDelegate: true,
    maxDelegationLevel: 3,
    reportingTo: 'COO',
    requiresTwoFactor: true,
    sessionTimeout: 360,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 8am-8pm'
    }
  },

  SUPPORT_SPECIALIST: {
    id: 'support-specialist',
    name: 'Creator Support Specialist',
    description: 'Provides support to creators via tickets and chat',
    department: 'Creator Support',
    jobTitle: 'Support Specialist',
    permissions: [
      Permission.SUPPORT_VIEW_TICKETS,
      Permission.SUPPORT_RESPOND,
      Permission.SUPPORT_ESCALATE,
      Permission.SUPPORT_CLOSE,
      Permission.CREATOR_VIEW,
      Permission.CONTENT_VIEW,
      Permission.FINANCE_VIEW_EARNINGS,
    ],
    dashboardAccess: ['support', 'creator-management'],
    dataAccessLevel: 'own',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'SUPPORT_MANAGER',
    requiresTwoFactor: false,
    sessionTimeout: 240,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Shift-based 24/7'
    }
  },

  // ============================================
  // MARKETING TEAM
  // ============================================

  MARKETING_MANAGER: {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    description: 'Manages marketing campaigns and creator outreach',
    department: 'Marketing',
    jobTitle: 'Marketing Manager',
    permissions: [
      Permission.MARKETING_CAMPAIGNS,
      Permission.MARKETING_EMAIL,
      Permission.MARKETING_ANALYTICS,
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_EXPORT,
      Permission.CREATOR_VIEW,
      Permission.CONTENT_VIEW,
      Permission.USER_VIEW,
    ],
    dashboardAccess: ['marketing', 'analytics', 'creator-management'],
    dataAccessLevel: 'department',
    canDelegate: true,
    maxDelegationLevel: 3,
    reportingTo: 'CMO',
    requiresTwoFactor: false,
    sessionTimeout: 360,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-6pm'
    }
  },

  MARKETING_COORDINATOR: {
    id: 'marketing-coordinator',
    name: 'Marketing Coordinator',
    description: 'Executes marketing campaigns and email outreach',
    department: 'Marketing',
    jobTitle: 'Marketing Coordinator',
    permissions: [
      Permission.MARKETING_CAMPAIGNS,
      Permission.MARKETING_EMAIL,
      Permission.MARKETING_ANALYTICS,
      Permission.ANALYTICS_VIEW,
      Permission.CREATOR_VIEW,
    ],
    dashboardAccess: ['marketing', 'analytics'],
    dataAccessLevel: 'team',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'MARKETING_MANAGER',
    requiresTwoFactor: false,
    sessionTimeout: 240,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-6pm'
    }
  },

  // ============================================
  // PLATFORM OPERATIONS
  // ============================================

  PLATFORM_MANAGER: {
    id: 'platform-manager',
    name: 'Platform Manager',
    description: 'Manages platform configurations and integrations',
    department: 'Technology',
    jobTitle: 'Platform Manager',
    permissions: [
      Permission.PLATFORM_VIEW,
      Permission.PLATFORM_EDIT,
      Permission.PLATFORM_CREATE,
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_ADMIN,
      Permission.CREATOR_VIEW,
      Permission.CONTENT_VIEW,
      Permission.ADMIN_SETTINGS,
      Permission.USER_VIEW,
    ],
    dashboardAccess: ['platform-management', 'admin', 'analytics'],
    dataAccessLevel: 'full',
    canDelegate: true,
    maxDelegationLevel: 3,
    reportingTo: 'CTO',
    requiresTwoFactor: true,
    sessionTimeout: 360,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-6pm'
    }
  },

  DEVELOPER: {
    id: 'developer',
    name: 'Software Developer',
    description: 'Develops and maintains platform features',
    department: 'Technology',
    jobTitle: 'Software Developer',
    permissions: [
      Permission.PLATFORM_VIEW,
      Permission.ANALYTICS_VIEW,
      Permission.ADMIN_AUDIT_LOGS,
      Permission.CREATOR_VIEW,
      Permission.CONTENT_VIEW,
    ],
    dashboardAccess: ['platform-management', 'analytics', 'audit-trail'],
    dataAccessLevel: 'department',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'CTO',
    requiresTwoFactor: true,
    sessionTimeout: 480,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Flexible'
    }
  },

  // ============================================
  // ANALYTICS & DATA
  // ============================================

  DATA_ANALYST: {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyzes platform data and generates reports',
    department: 'Analytics',
    jobTitle: 'Data Analyst',
    permissions: [
      Permission.ANALYTICS_VIEW,
      Permission.ANALYTICS_EXPORT,
      Permission.CREATOR_VIEW,
      Permission.CONTENT_VIEW,
      Permission.FINANCE_VIEW_REPORTS,
      Permission.PLATFORM_VIEW,
    ],
    dashboardAccess: ['analytics', 'revenue-reports'],
    dataAccessLevel: 'full',
    canDelegate: false,
    maxDelegationLevel: 0,
    reportingTo: 'HEAD_OF_ANALYTICS',
    requiresTwoFactor: false,
    sessionTimeout: 360,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-6pm'
    }
  },

  // ============================================
  // LIMITED ACCESS ROLES
  // ============================================

  INTERN: {
    id: 'intern',
    name: 'Intern',
    description: 'Limited read-only access for training purposes',
    department: 'Various',
    jobTitle: 'Intern',
    permissions: [
      Permission.ANALYTICS_VIEW,
      Permission.CREATOR_VIEW,
    ],
    dashboardAccess: ['analytics'],
    dataAccessLevel: 'own',
    canDelegate: false,
    maxDelegationLevel: 0,
    requiresTwoFactor: false,
    sessionTimeout: 120,
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'Mon-Fri 9am-5pm'
    }
  },

  CONTRACTOR: {
    id: 'contractor',
    name: 'Contractor',
    description: 'Limited access for specific project work',
    department: 'Various',
    jobTitle: 'Contractor',
    permissions: [
      Permission.ANALYTICS_VIEW,
      Permission.CREATOR_VIEW,
      Permission.CONTENT_VIEW,
    ],
    dashboardAccess: ['analytics'],
    dataAccessLevel: 'own',
    canDelegate: false,
    maxDelegationLevel: 0,
    requiresTwoFactor: false,
    sessionTimeout: 240,
    allowedIPRanges: [], // Must be configured per contractor
    workingHours: {
      timezone: 'America/Los_Angeles',
      schedule: 'As defined in contract'
    }
  },
};

/**
 * Get access profile by ID
 */
export function getAccessProfile(profileId: string): AccessProfile | undefined {
  return ACCESS_PROFILES[profileId];
}

/**
 * Get all access profiles for a department
 */
export function getAccessProfilesByDepartment(department: string): AccessProfile[] {
  return Object.values(ACCESS_PROFILES).filter(
    profile => profile.department === department
  );
}

/**
 * Check if a profile has a specific permission
 */
export function hasPermission(profile: AccessProfile, permission: Permission): boolean {
  return profile.permissions.includes(permission);
}

/**
 * Get all unique departments
 */
export function getAllDepartments(): string[] {
  return [...new Set(Object.values(ACCESS_PROFILES).map(p => p.department))];
}

/**
 * Get all job titles
 */
export function getAllJobTitles(): string[] {
  return Object.values(ACCESS_PROFILES).map(p => p.jobTitle);
}
