/**
 * FANZ New Hire Onboarding Templates
 * Pre-configured onboarding settings for quick new hire setup
 */

import { AccessProfile } from './AccessProfiles';
import { JobDescriptionTemplate } from './JobDescriptionTemplates';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: 'hr' | 'it' | 'training' | 'compliance' | 'team';
  dueDay: number; // Day of onboarding (day 1, day 2, etc.)
  assignedTo: 'employee' | 'manager' | 'hr' | 'it' | 'compliance';
  estimatedMinutes: number;
  prerequisites?: string[];
  completionCriteria: string;
  resources?: string[];
}

export interface OnboardingTemplate {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  durationDays: number;
  tasks: OnboardingTask[];
  welcomeMessage: string;
  firstDayAgenda: string[];
  firstWeekGoals: string[];
  firstMonthGoals: string[];
  requiredSoftware: string[];
  requiredAccess: string[];
  buddyProgramIncluded: boolean;
  checkInSchedule: {
    day: number;
    type: '1:1' | 'team-meeting' | 'hr-check-in' | 'training-session';
    attendees: string[];
    duration: number; // minutes
    agenda: string;
  }[];
}

export const ONBOARDING_TEMPLATES: Record<string, OnboardingTemplate> = {
  // ============================================
  // COMPLIANCE TEAM ONBOARDING
  // ============================================

  COMPLIANCE_OFFICER_ONBOARDING: {
    id: 'compliance-officer-onboarding',
    name: 'Compliance Officer Onboarding',
    jobTitle: 'Compliance Officer',
    department: 'Legal & Compliance',
    durationDays: 14,
    welcomeMessage: 'Welcome to FANZ! As a Compliance Officer, you play a critical role in ensuring creator safety and regulatory compliance across our 94-platform ecosystem. Your work directly protects creators, the company, and our community.',
    firstDayAgenda: [
      '9:00 AM - Welcome meeting with Compliance Manager',
      '10:00 AM - HR orientation and paperwork',
      '11:00 AM - IT setup (laptop, accounts, VPN)',
      '12:00 PM - Lunch with team',
      '1:00 PM - Platform overview and demo',
      '2:00 PM - Introduction to 2257 compliance',
      '3:00 PM - Shadow senior compliance officer',
      '4:30 PM - End-of-day debrief with manager'
    ],
    firstWeekGoals: [
      'Complete all required compliance training modules',
      'Shadow 20+ verification reviews',
      'Understand 2257 record-keeping requirements',
      'Meet all team members',
      'Review first verification independently (with oversight)'
    ],
    firstMonthGoals: [
      'Process 100+ verifications independently',
      'Achieve 99%+ verification accuracy',
      'Handle escalated cases with manager guidance',
      'Contribute to policy documentation improvements',
      'Build rapport with creator support team'
    ],
    requiredSoftware: [
      'FANZ Dashboard Access',
      'Compliance Management System',
      'Document Storage (Encrypted)',
      'Slack (team communication)',
      'Zoom (meetings)',
      'Google Workspace',
      'LastPass (password manager)',
      '1Password (2FA)'
    ],
    requiredAccess: [
      'FanzDash Compliance Portal',
      'Creator Verification System',
      'Document Repository (read/write)',
      'Internal Knowledge Base',
      'Support Ticketing System (read-only)',
      'Compliance Slack Channel',
      'Legal Shared Drive'
    ],
    buddyProgramIncluded: true,
    tasks: [
      // DAY 1
      {
        id: 'complete-hr-onboarding',
        title: 'Complete HR Onboarding Paperwork',
        description: 'Fill out tax forms (W-4/W-9), benefits enrollment, emergency contacts, and company policies acknowledgment.',
        category: 'hr',
        dueDay: 1,
        assignedTo: 'employee',
        estimatedMinutes: 60,
        completionCriteria: 'All HR forms submitted and acknowledged in BambooHR',
        resources: ['HR Portal', 'Benefits Guide PDF']
      },
      {
        id: 'it-setup',
        title: 'IT Setup and Accounts',
        description: 'Receive laptop, set up accounts (email, Slack, VPN), install required software, configure 2FA.',
        category: 'it',
        dueDay: 1,
        assignedTo: 'it',
        estimatedMinutes: 90,
        completionCriteria: 'All accounts active, 2FA configured, VPN connection verified',
        resources: ['IT Setup Guide', 'Security Policy']
      },
      {
        id: 'security-training',
        title: 'Complete Security & Confidentiality Training',
        description: 'Watch security training videos, acknowledge data handling policies, complete security quiz.',
        category: 'compliance',
        dueDay: 1,
        assignedTo: 'employee',
        estimatedMinutes: 45,
        prerequisites: ['it-setup'],
        completionCriteria: 'Training completed with 100% quiz score',
        resources: ['Security Training Module', 'Data Privacy Policy']
      },
      {
        id: 'meet-team',
        title: 'Meet Your Team',
        description: 'Introduction meeting with Compliance Manager and team members. Learn about team structure and dynamics.',
        category: 'team',
        dueDay: 1,
        assignedTo: 'manager',
        estimatedMinutes: 60,
        completionCriteria: 'Attended team introduction meeting',
        resources: ['Team Directory', 'Org Chart']
      },

      // DAY 2
      {
        id: '2257-training-part1',
        title: '2257 Compliance Training - Part 1',
        description: 'Deep dive into 2257 record-keeping requirements, federal regulations, and FANZ compliance procedures.',
        category: 'training',
        dueDay: 2,
        assignedTo: 'employee',
        estimatedMinutes: 180,
        prerequisites: ['security-training'],
        completionCriteria: 'Completed training module and passed certification exam (90%+)',
        resources: ['2257 Training Module', 'Federal Regulations PDF', 'FANZ Compliance Manual']
      },
      {
        id: 'shadow-verification-1',
        title: 'Shadow Verification Reviews (Session 1)',
        description: 'Shadow senior compliance officer reviewing 10 verification cases. Take notes on decision process.',
        category: 'training',
        dueDay: 2,
        assignedTo: 'manager',
        estimatedMinutes: 120,
        prerequisites: ['2257-training-part1'],
        completionCriteria: 'Observed 10 cases, submitted reflection notes',
        resources: ['Verification Decision Framework', 'Common Red Flags Checklist']
      },

      // DAY 3
      {
        id: 'identity-verification-training',
        title: 'Identity Verification Best Practices',
        description: 'Learn to spot fake IDs, verify document authenticity, use verification tools.',
        category: 'training',
        dueDay: 3,
        assignedTo: 'employee',
        estimatedMinutes: 150,
        prerequisites: ['2257-training-part1'],
        completionCriteria: 'Completed training and passed ID verification quiz (95%+)',
        resources: ['ID Verification Guide', 'Fake ID Database', 'Document Analysis Tools']
      },
      {
        id: 'shadow-verification-2',
        title: 'Shadow Verification Reviews (Session 2)',
        description: 'Shadow another 15 cases, begin to verbalize decision reasoning aloud.',
        category: 'training',
        dueDay: 3,
        assignedTo: 'manager',
        estimatedMinutes: 120,
        prerequisites: ['shadow-verification-1'],
        completionCriteria: 'Observed 15 cases, demonstrated understanding in discussion',
        resources: []
      },

      // DAY 4-5
      {
        id: 'practice-verifications',
        title: 'Practice Verifications with Oversight',
        description: 'Review 20 verification cases independently, then discuss decisions with senior officer.',
        category: 'training',
        dueDay: 4,
        assignedTo: 'employee',
        estimatedMinutes: 240,
        prerequisites: ['identity-verification-training', 'shadow-verification-2'],
        completionCriteria: 'Completed 20 reviews with 95%+ accuracy',
        resources: ['Practice Case Database']
      },
      {
        id: 'gdpr-privacy-training',
        title: 'GDPR & Privacy Compliance Training',
        description: 'Learn data privacy requirements, GDPR/CCPA compliance, and data handling procedures.',
        category: 'compliance',
        dueDay: 5,
        assignedTo: 'employee',
        estimatedMinutes: 90,
        completionCriteria: 'Completed training module and certification',
        resources: ['GDPR Training', 'Privacy Policy', 'Data Retention Schedule']
      },
      {
        id: 'escalation-training',
        title: 'Escalation Procedures & Red Flags',
        description: 'Learn when and how to escalate cases, recognizing high-risk situations.',
        category: 'training',
        dueDay: 5,
        assignedTo: 'manager',
        estimatedMinutes: 60,
        completionCriteria: 'Completed escalation scenarios workshop',
        resources: ['Escalation Matrix', 'Red Flag Indicators']
      },

      // WEEK 2
      {
        id: 'supervised-solo-reviews',
        title: 'Begin Solo Reviews (Supervised)',
        description: 'Start processing real verification cases with manager spot-checking your work.',
        category: 'training',
        dueDay: 8,
        assignedTo: 'employee',
        estimatedMinutes: 480,
        prerequisites: ['practice-verifications'],
        completionCriteria: 'Process 30+ cases with 98%+ accuracy',
        resources: []
      },
      {
        id: 'creator-communication-training',
        title: 'Creator Communication Training',
        description: 'Learn how to communicate verification decisions, handle rejections sensitively.',
        category: 'training',
        dueDay: 9,
        assignedTo: 'employee',
        estimatedMinutes: 90,
        completionCriteria: 'Completed communication workshop',
        resources: ['Communication Templates', 'Empathy in Compliance Guide']
      },
      {
        id: 'documentation-training',
        title: 'Documentation & Record-Keeping',
        description: 'Learn proper documentation procedures, audit trail requirements, note-taking best practices.',
        category: 'training',
        dueDay: 10,
        assignedTo: 'employee',
        estimatedMinutes: 60,
        completionCriteria: 'Submitted sample documentation for review',
        resources: ['Documentation Standards', 'Audit Checklist']
      },
      {
        id: 'qa-review',
        title: 'Quality Assurance Review',
        description: 'Manager reviews your first 50 cases, provides detailed feedback.',
        category: 'training',
        dueDay: 11,
        assignedTo: 'manager',
        estimatedMinutes: 120,
        prerequisites: ['supervised-solo-reviews'],
        completionCriteria: 'Received and acknowledged feedback',
        resources: []
      },
      {
        id: 'wellness-training',
        title: 'Wellness & Self-Care for Compliance Work',
        description: 'Learn about secondary trauma, self-care strategies, and available mental health resources.',
        category: 'training',
        dueDay: 12,
        assignedTo: 'hr',
        estimatedMinutes: 60,
        completionCriteria: 'Completed wellness workshop',
        resources: ['Wellness Resources', 'Counseling Services Info']
      },
      {
        id: 'full-access-granted',
        title: 'Full System Access Granted',
        description: 'Receive full production access to process verifications independently.',
        category: 'it',
        dueDay: 14,
        assignedTo: 'it',
        estimatedMinutes: 15,
        prerequisites: ['qa-review'],
        completionCriteria: 'Production access enabled',
        resources: []
      },
      {
        id: 'end-onboarding-review',
        title: '2-Week Onboarding Review',
        description: 'Final meeting with manager to review progress, set goals, answer questions.',
        category: 'hr',
        dueDay: 14,
        assignedTo: 'manager',
        estimatedMinutes: 60,
        completionCriteria: 'Completed onboarding survey and goal-setting',
        resources: ['Onboarding Survey', 'Goal Template']
      }
    ],
    checkInSchedule: [
      {
        day: 1,
        type: '1:1',
        attendees: ['New Hire', 'Compliance Manager'],
        duration: 30,
        agenda: 'Welcome, overview of role, answer initial questions, set expectations'
      },
      {
        day: 3,
        type: '1:1',
        attendees: ['New Hire', 'Compliance Manager'],
        duration: 30,
        agenda: 'Review training progress, address any concerns, clarify processes'
      },
      {
        day: 5,
        type: 'team-meeting',
        attendees: ['Compliance Team'],
        duration: 60,
        agenda: 'Weekly team sync, new hire introduction, case discussions'
      },
      {
        day: 7,
        type: 'hr-check-in',
        attendees: ['New Hire', 'HR Business Partner'],
        duration: 30,
        agenda: 'Check on well-being, benefits questions, workplace satisfaction'
      },
      {
        day: 10,
        type: '1:1',
        attendees: ['New Hire', 'Compliance Manager'],
        duration: 45,
        agenda: 'Performance feedback, Q&A, discuss any challenges'
      },
      {
        day: 14,
        type: '1:1',
        attendees: ['New Hire', 'Compliance Manager'],
        duration: 60,
        agenda: 'Onboarding completion review, goal setting, career development discussion'
      }
    ]
  },

  // ============================================
  // SUPPORT TEAM ONBOARDING
  // ============================================

  SUPPORT_SPECIALIST_ONBOARDING: {
    id: 'support-specialist-onboarding',
    name: 'Creator Support Specialist Onboarding',
    jobTitle: 'Creator Support Specialist',
    department: 'Creator Support',
    durationDays: 10,
    welcomeMessage: 'Welcome to the FANZ Creator Support team! You\'ll be the first line of support for thousands of creators building their businesses on our platforms. Your empathy, problem-solving, and product knowledge will directly impact creator success.',
    firstDayAgenda: [
      '9:00 AM - Welcome with Support Manager',
      '10:00 AM - HR orientation',
      '11:00 AM - IT setup and tools access',
      '12:00 PM - Team lunch (virtual or in-person)',
      '1:00 PM - Platform walkthrough and creator perspective',
      '2:30 PM - Introduction to support tools (Zendesk, Slack)',
      '3:30 PM - Shadow live support session',
      '4:30 PM - Day 1 wrap-up'
    ],
    firstWeekGoals: [
      'Complete platform feature training',
      'Shadow 30+ support tickets',
      'Handle first 10 tickets with guidance',
      'Learn escalation procedures',
      'Meet all team members'
    ],
    firstMonthGoals: [
      'Handle 40-60 tickets per day independently',
      'Maintain 4.5+ CSAT score',
      'Response time < 2 hours',
      'Become proficient in 5 core platform features',
      'Contribute to knowledge base'
    ],
    requiredSoftware: [
      'Zendesk (ticketing)',
      'Intercom (live chat)',
      'Slack',
      'Zoom',
      'FANZ Dashboard',
      'Google Workspace',
      'LastPass'
    ],
    requiredAccess: [
      'Zendesk Agent Access',
      'Intercom Support Access',
      'FanzDash Support View',
      'Creator Lookup Tool',
      'Knowledge Base (edit access)',
      'Support Slack Channels',
      'Internal Wiki'
    ],
    buddyProgramIncluded: true,
    tasks: [
      {
        id: 'hr-setup-support',
        title: 'Complete HR Onboarding',
        description: 'Benefits, tax forms, policies, remote work agreement.',
        category: 'hr',
        dueDay: 1,
        assignedTo: 'employee',
        estimatedMinutes: 60,
        completionCriteria: 'All HR paperwork submitted',
        resources: ['HR Portal']
      },
      {
        id: 'it-setup-support',
        title: 'IT Setup',
        description: 'Laptop, accounts, support tools, VPN, 2FA setup.',
        category: 'it',
        dueDay: 1,
        assignedTo: 'it',
        estimatedMinutes: 90,
        completionCriteria: 'All systems accessible',
        resources: ['IT Guide']
      },
      {
        id: 'platform-training-support',
        title: 'Platform Features Training',
        description: 'Learn all core platform features from creator perspective.',
        category: 'training',
        dueDay: 2,
        assignedTo: 'employee',
        estimatedMinutes: 240,
        prerequisites: ['it-setup-support'],
        completionCriteria: 'Completed platform training modules',
        resources: ['Platform Guide', 'Video Tutorials']
      },
      {
        id: 'shadow-tickets-1',
        title: 'Shadow Support Tickets (Session 1)',
        description: 'Observe 15 tickets being handled by experienced agents.',
        category: 'training',
        dueDay: 2,
        assignedTo: 'manager',
        estimatedMinutes: 120,
        completionCriteria: 'Observed 15 tickets, took notes',
        resources: []
      },
      {
        id: 'communication-training-support',
        title: 'Support Communication Training',
        description: 'Learn tone, empathy, de-escalation, professional communication.',
        category: 'training',
        dueDay: 3,
        assignedTo: 'employee',
        estimatedMinutes: 120,
        completionCriteria: 'Completed communication workshop',
        resources: ['Communication Guide', 'Template Library']
      },
      {
        id: 'practice-tickets',
        title: 'Practice Tickets (Test Environment)',
        description: 'Handle 20 practice tickets in test environment.',
        category: 'training',
        dueDay: 4,
        assignedTo: 'employee',
        estimatedMinutes: 180,
        prerequisites: ['platform-training-support', 'communication-training-support'],
        completionCriteria: 'Completed 20 practice tickets with manager review',
        resources: ['Practice Ticket Database']
      },
      {
        id: 'escalation-training-support',
        title: 'Escalation & Complex Cases',
        description: 'Learn when to escalate, how to handle difficult situations.',
        category: 'training',
        dueDay: 5,
        assignedTo: 'manager',
        estimatedMinutes: 90,
        completionCriteria: 'Completed escalation training',
        resources: ['Escalation Matrix']
      },
      {
        id: 'supervised-live-tickets',
        title: 'Handle Live Tickets (Supervised)',
        description: 'Start handling real tickets with manager reviewing responses.',
        category: 'training',
        dueDay: 6,
        assignedTo: 'employee',
        estimatedMinutes: 360,
        prerequisites: ['practice-tickets'],
        completionCriteria: 'Handled 20 tickets with 95% approval rate',
        resources: []
      },
      {
        id: 'kb-contribution',
        title: 'Knowledge Base Training',
        description: 'Learn to use and contribute to internal knowledge base.',
        category: 'training',
        dueDay: 7,
        assignedTo: 'employee',
        estimatedMinutes: 60,
        completionCriteria: 'Created 2 KB articles',
        resources: ['KB Guidelines']
      },
      {
        id: 'qa-check-support',
        title: 'Quality Assurance Check',
        description: 'QA team reviews your tickets, provides feedback.',
        category: 'training',
        dueDay: 8,
        assignedTo: 'manager',
        estimatedMinutes: 60,
        completionCriteria: 'Received QA feedback',
        resources: []
      },
      {
        id: 'full-production-support',
        title: 'Begin Full Production Support',
        description: 'Start handling tickets independently at full capacity.',
        category: 'training',
        dueDay: 10,
        assignedTo: 'employee',
        estimatedMinutes: 480,
        prerequisites: ['qa-check-support'],
        completionCriteria: 'Handling 30+ tickets/day independently',
        resources: []
      }
    ],
    checkInSchedule: [
      {
        day: 1,
        type: '1:1',
        attendees: ['New Hire', 'Support Manager'],
        duration: 30,
        agenda: 'Welcome, role overview, expectations'
      },
      {
        day: 3,
        type: '1:1',
        attendees: ['New Hire', 'Support Manager'],
        duration: 30,
        agenda: 'Training progress check, Q&A'
      },
      {
        day: 5,
        type: 'team-meeting',
        attendees: ['Support Team'],
        duration: 30,
        agenda: 'Team standup, new hire intro'
      },
      {
        day: 7,
        type: '1:1',
        attendees: ['New Hire', 'Support Manager'],
        duration: 30,
        agenda: 'Performance feedback, address challenges'
      },
      {
        day: 10,
        type: '1:1',
        attendees: ['New Hire', 'Support Manager'],
        duration: 45,
        agenda: 'Onboarding completion, goal setting'
      }
    ]
  },

  // ============================================
  // FINANCE TEAM ONBOARDING
  // ============================================

  FINANCE_ANALYST_ONBOARDING: {
    id: 'finance-analyst-onboarding',
    name: 'Finance Analyst Onboarding',
    jobTitle: 'Finance Analyst',
    department: 'Finance',
    durationDays: 14,
    welcomeMessage: 'Welcome to FANZ Finance! You\'ll be responsible for processing millions of dollars in creator payouts each week. Accuracy, attention to detail, and fraud prevention are critical to your success.',
    firstDayAgenda: [
      '9:00 AM - Welcome with Finance Manager',
      '10:00 AM - HR orientation',
      '11:00 AM - IT setup',
      '12:00 PM - Lunch',
      '1:00 PM - Overview of payout systems',
      '2:00 PM - Introduction to payment processors',
      '3:00 PM - Shadow payout processing',
      '4:30 PM - End of day debrief'
    ],
    firstWeekGoals: [
      'Understand payout workflow end-to-end',
      'Learn payment processor interfaces',
      'Complete fraud detection training',
      'Shadow 50+ payout reviews',
      'Process first payouts with oversight'
    ],
    firstMonthGoals: [
      'Process payouts independently with 99.9%+ accuracy',
      'Handle escalations and discrepancies',
      'Generate weekly financial reports',
      'Identify and prevent fraud attempts',
      'Build relationships with payment processors'
    ],
    requiredSoftware: [
      'FANZ Finance Dashboard',
      'Paxum Portal',
      'Cosmo Payment Portal',
      'QuickBooks Online',
      'Excel/Google Sheets',
      'SQL Client',
      'Slack',
      'DocuSign'
    ],
    requiredAccess: [
      'Finance Dashboard (Full Access)',
      'Payment Processor Portals',
      'Banking Accounts (View Only)',
      'Creator Earnings Database',
      'Financial Reporting Tools',
      'Tax Document Repository',
      'Fraud Detection System'
    ],
    buddyProgramIncluded: true,
    tasks: [
      {
        id: 'hr-finance',
        title: 'HR Onboarding',
        description: 'Complete all HR paperwork and background check.',
        category: 'hr',
        dueDay: 1,
        assignedTo: 'employee',
        estimatedMinutes: 60,
        completionCriteria: 'HR paperwork complete',
        resources: []
      },
      {
        id: 'it-finance',
        title: 'IT Setup',
        description: 'Secure workstation setup, enhanced security protocols.',
        category: 'it',
        dueDay: 1,
        assignedTo: 'it',
        estimatedMinutes: 120,
        completionCriteria: 'All systems operational with enhanced security',
        resources: []
      },
      {
        id: 'payout-workflow-training',
        title: 'Payout Workflow Training',
        description: 'Learn complete payout process from request to completion.',
        category: 'training',
        dueDay: 2,
        assignedTo: 'employee',
        estimatedMinutes: 180,
        completionCriteria: 'Completed workflow training module',
        resources: ['Payout Process Guide']
      },
      {
        id: 'payment-processor-training',
        title: 'Payment Processor Systems',
        description: 'Learn Paxum, Cosmo Payment, and ACH systems.',
        category: 'training',
        dueDay: 3,
        assignedTo: 'employee',
        estimatedMinutes: 240,
        completionCriteria: 'Certified on all payment systems',
        resources: ['Processor Training Modules']
      },
      {
        id: 'fraud-detection-training',
        title: 'Fraud Detection Training',
        description: 'Learn to spot fraud patterns, red flags, prevention techniques.',
        category: 'compliance',
        dueDay: 4,
        assignedTo: 'employee',
        estimatedMinutes: 180,
        completionCriteria: 'Completed fraud training and passed exam',
        resources: ['Fraud Prevention Guide']
      },
      {
        id: 'tax-compliance-training',
        title: 'Tax Compliance (1099s, W-9s)',
        description: 'Learn tax form requirements and IRS reporting.',
        category: 'compliance',
        dueDay: 5,
        assignedTo: 'employee',
        estimatedMinutes: 120,
        completionCriteria: 'Completed tax compliance training',
        resources: ['Tax Compliance Manual']
      },
      {
        id: 'practice-payouts',
        title: 'Practice Payout Processing',
        description: 'Process 30 payouts in test environment.',
        category: 'training',
        dueDay: 6,
        assignedTo: 'employee',
        estimatedMinutes: 240,
        prerequisites: ['payout-workflow-training', 'payment-processor-training'],
        completionCriteria: '30 practice payouts with 100% accuracy',
        resources: []
      },
      {
        id: 'supervised-payouts',
        title: 'Supervised Payout Processing',
        description: 'Process real payouts with manager review.',
        category: 'training',
        dueDay: 8,
        assignedTo: 'employee',
        estimatedMinutes: 360,
        prerequisites: ['practice-payouts'],
        completionCriteria: '50 payouts processed with manager approval',
        resources: []
      },
      {
        id: 'reporting-training',
        title: 'Financial Reporting Training',
        description: 'Learn to generate and analyze financial reports.',
        category: 'training',
        dueDay: 10,
        assignedTo: 'employee',
        estimatedMinutes: 180,
        completionCriteria: 'Generated sample reports',
        resources: ['Reporting Guide']
      },
      {
        id: 'quality-check-finance',
        title: 'Quality Check',
        description: 'Manager reviews your work for accuracy.',
        category: 'training',
        dueDay: 12,
        assignedTo: 'manager',
        estimatedMinutes: 120,
        completionCriteria: 'Passed quality review',
        resources: []
      },
      {
        id: 'independent-processing',
        title: 'Begin Independent Processing',
        description: 'Start processing payouts independently.',
        category: 'training',
        dueDay: 14,
        assignedTo: 'employee',
        estimatedMinutes: 480,
        prerequisites: ['quality-check-finance'],
        completionCriteria: 'Processing payouts at full capacity',
        resources: []
      }
    ],
    checkInSchedule: [
      {
        day: 1,
        type: '1:1',
        attendees: ['New Hire', 'Finance Manager'],
        duration: 45,
        agenda: 'Welcome, role expectations, security protocols'
      },
      {
        day: 3,
        type: '1:1',
        attendees: ['New Hire', 'Finance Manager'],
        duration: 30,
        agenda: 'Training progress, technical questions'
      },
      {
        day: 7,
        type: '1:1',
        attendees: ['New Hire', 'Finance Manager'],
        duration: 45,
        agenda: 'Performance review, accuracy check'
      },
      {
        day: 14,
        type: '1:1',
        attendees: ['New Hire', 'Finance Manager'],
        duration: 60,
        agenda: 'Onboarding completion, certification, goal setting'
      }
    ]
  }
};

/**
 * Get onboarding template by ID
 */
export function getOnboardingTemplate(templateId: string): OnboardingTemplate | undefined {
  return ONBOARDING_TEMPLATES[templateId];
}

/**
 * Get onboarding template by job title
 */
export function getOnboardingTemplateByJob(jobTitle: string): OnboardingTemplate | undefined {
  return Object.values(ONBOARDING_TEMPLATES).find(t => t.jobTitle === jobTitle);
}

/**
 * Get all tasks for a specific day
 */
export function getTasksByDay(template: OnboardingTemplate, day: number): OnboardingTask[] {
  return template.tasks.filter(t => t.dueDay === day);
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(template: OnboardingTemplate, category: string): OnboardingTask[] {
  return template.tasks.filter(t => t.category === category);
}
