/**
 * FANZ Job Description Templates
 * Pre-configured job descriptions with access profiles for quick hiring
 */

import { AccessProfile, ACCESS_PROFILES } from './AccessProfiles';

export interface JobDescriptionTemplate {
  id: string;
  title: string;
  department: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  accessProfile: string; // References ACCESS_PROFILES key
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  onboardingDuration: number; // in days
  probationPeriod: number; // in days
  reportsTo: string;
  teamSize?: number;
  remotePolicy: 'remote' | 'hybrid' | 'onsite';
  travelRequired: string;
  trainingModules: string[];
  kpis: string[];
}

export const JOB_TEMPLATES: Record<string, JobDescriptionTemplate> = {
  // ============================================
  // COMPLIANCE & LEGAL
  // ============================================

  COMPLIANCE_OFFICER: {
    id: 'compliance-officer',
    title: 'Compliance Officer',
    department: 'Legal & Compliance',
    level: 'mid',
    accessProfile: 'COMPLIANCE_OFFICER',
    salary: {
      min: 65000,
      max: 85000,
      currency: 'USD'
    },
    responsibilities: [
      'Review creator identity verification documents for 2257 compliance',
      'Approve or reject creator verification applications',
      'Monitor content uploads for policy compliance',
      'Process age verification requests within 24 hours',
      'Maintain accurate records of all verification documentation',
      'Flag suspicious accounts for manager review',
      'Respond to compliance inquiries from creators',
      'Assist with audits and regulatory reporting'
    ],
    requirements: [
      'Bachelor\'s degree in Legal Studies, Criminal Justice, or related field',
      '2+ years experience in compliance, legal, or regulatory roles',
      'Knowledge of 2257 record-keeping requirements',
      'Experience with identity verification processes',
      'Strong attention to detail and documentation skills',
      'Ability to handle sensitive content professionally',
      'Excellent written and verbal communication'
    ],
    niceToHave: [
      'Previous experience in adult industry compliance',
      'Paralegal certification',
      'Experience with GDPR/CCPA compliance',
      'Bilingual (English + Spanish)',
      'Background in trust & safety'
    ],
    benefits: [
      'Health, dental, vision insurance',
      '401(k) with 4% company match',
      'Unlimited PTO policy',
      'Remote work options',
      'Professional development budget ($2,000/year)',
      'Mental health support and counseling'
    ],
    onboardingDuration: 14,
    probationPeriod: 90,
    reportsTo: 'Compliance Manager',
    remotePolicy: 'hybrid',
    travelRequired: 'Rare (1-2 times/year for training)',
    trainingModules: [
      '2257 Compliance Training',
      'Identity Verification Best Practices',
      'Content Policy Review',
      'GDPR & Privacy Compliance',
      'Document Management Systems',
      'Crisis Management & Escalation'
    ],
    kpis: [
      'Average verification processing time < 12 hours',
      'Verification accuracy rate > 99%',
      'Zero compliance violations',
      'Creator satisfaction score > 4.5/5'
    ]
  },

  CONTENT_MODERATOR: {
    id: 'content-moderator',
    title: 'Content Moderator',
    department: 'Legal & Compliance',
    level: 'entry',
    accessProfile: 'CONTENT_MODERATOR',
    salary: {
      min: 45000,
      max: 60000,
      currency: 'USD'
    },
    responsibilities: [
      'Review flagged content for policy violations',
      'Approve or reject content based on community guidelines',
      'Document violations and maintain review records',
      'Escalate complex cases to compliance team',
      'Process content reports within SLA (4 hours)',
      'Identify patterns of policy violations',
      'Provide feedback to creators on policy compliance'
    ],
    requirements: [
      'High school diploma or equivalent (Bachelor\'s preferred)',
      '1+ years customer service or content moderation experience',
      'Ability to review sensitive adult content professionally',
      'Strong decision-making and judgment skills',
      'Excellent attention to detail',
      'Comfortable working in shift-based environment',
      'Fast and accurate typing skills (50+ WPM)'
    ],
    niceToHave: [
      'Experience moderating adult content',
      'Knowledge of social media platforms',
      'Psychology or sociology background',
      'Bilingual capabilities',
      'Previous trust & safety experience'
    ],
    benefits: [
      'Health, dental, vision insurance',
      '401(k) with 4% match',
      'PTO (15 days/year)',
      'Shift differential pay for nights/weekends',
      'Monthly wellness stipend ($100)',
      'Free counseling services'
    ],
    onboardingDuration: 7,
    probationPeriod: 90,
    reportsTo: 'Compliance Manager',
    remotePolicy: 'remote',
    travelRequired: 'None',
    trainingModules: [
      'Content Policy Guidelines',
      'Moderation Decision Framework',
      'Trauma-Informed Content Review',
      'Escalation Procedures',
      'Creator Communication',
      'Self-Care for Moderators'
    ],
    kpis: [
      'Average review time < 5 minutes per item',
      'Decision accuracy rate > 95%',
      'SLA compliance > 98%',
      'Appeal overturn rate < 5%'
    ]
  },

  COMPLIANCE_MANAGER: {
    id: 'compliance-manager',
    title: 'Compliance Manager',
    department: 'Legal & Compliance',
    level: 'senior',
    accessProfile: 'COMPLIANCE_MANAGER',
    salary: {
      min: 95000,
      max: 130000,
      currency: 'USD'
    },
    responsibilities: [
      'Lead compliance team (6-10 officers)',
      'Develop and update compliance policies and procedures',
      'Oversee all creator verification and content moderation',
      'Manage relationships with regulatory bodies',
      'Conduct internal compliance audits',
      'Handle escalated compliance cases',
      'Report compliance metrics to CCO',
      'Coordinate with legal counsel on complex cases',
      'Train new compliance staff'
    ],
    requirements: [
      'Bachelor\'s degree in Legal Studies or related field (Master\'s preferred)',
      '5+ years compliance experience (2+ in management)',
      'Deep knowledge of 2257 and adult industry regulations',
      'Strong leadership and team management skills',
      'Experience with compliance management systems',
      'Excellent analytical and problem-solving abilities'
    ],
    niceToHave: [
      'JD or legal certification',
      'Previous experience as Chief Compliance Officer',
      'Experience in fintech or payment compliance',
      'Certified Compliance & Ethics Professional (CCEP)',
      'Crisis management experience'
    ],
    benefits: [
      'Comprehensive health benefits',
      '401(k) with 6% match',
      'Unlimited PTO',
      'Remote work flexibility',
      'Professional development ($5,000/year)',
      'Annual performance bonus (10-20%)'
    ],
    onboardingDuration: 21,
    probationPeriod: 90,
    reportsTo: 'Chief Compliance Officer',
    teamSize: 8,
    remotePolicy: 'hybrid',
    travelRequired: 'Quarterly (4-6 times/year)',
    trainingModules: [
      'Leadership & Team Management',
      'Advanced 2257 Compliance',
      'Risk Assessment & Mitigation',
      'Regulatory Reporting',
      'Crisis Management',
      'Legal Research & Analysis'
    ],
    kpis: [
      'Zero regulatory violations or fines',
      'Team productivity > 95%',
      'Average case resolution time < 48 hours',
      'Team retention rate > 90%',
      'Audit pass rate 100%'
    ]
  },

  // ============================================
  // FINANCE TEAM
  // ============================================

  FINANCE_ANALYST: {
    id: 'finance-analyst',
    title: 'Finance Analyst',
    department: 'Finance',
    level: 'mid',
    accessProfile: 'FINANCE_ANALYST',
    salary: {
      min: 70000,
      max: 95000,
      currency: 'USD'
    },
    responsibilities: [
      'Process weekly creator payouts ($5M+/week)',
      'Verify payout eligibility and documentation',
      'Generate financial reports and dashboards',
      'Reconcile payment processor transactions',
      'Investigate payment discrepancies',
      'Monitor for fraud and suspicious activity',
      'Respond to creator payout inquiries',
      'Maintain accurate financial records'
    ],
    requirements: [
      'Bachelor\'s degree in Finance, Accounting, or Economics',
      '2-4 years experience in finance or accounting',
      'Strong Excel/Google Sheets skills (pivot tables, VLOOKUP, etc.)',
      'Experience with payment processing systems',
      'Excellent numerical accuracy and attention to detail',
      'Knowledge of financial regulations and compliance'
    ],
    niceToHave: [
      'CPA or working toward certification',
      'Experience with Paxum, Cosmo Payment, or adult payment processors',
      'SQL or data analysis skills',
      'Experience in fintech or e-commerce',
      'Knowledge of international payments'
    ],
    benefits: [
      'Full health benefits package',
      '401(k) with 4% match',
      'PTO (20 days/year)',
      'Remote work options',
      'CPA exam support and bonuses',
      'Annual performance bonus (5-10%)'
    ],
    onboardingDuration: 14,
    probationPeriod: 90,
    reportsTo: 'Finance Manager',
    remotePolicy: 'hybrid',
    travelRequired: 'Minimal (1-2 times/year)',
    trainingModules: [
      'Payment Processing Systems',
      'Payout Workflows & SLAs',
      'Fraud Detection & Prevention',
      'Financial Reporting Tools',
      'Tax Compliance (1099s, W-9s)',
      'Creator Support Best Practices'
    ],
    kpis: [
      'Payout processing accuracy > 99.9%',
      'Average payout time < 3 business days',
      'Discrepancy resolution < 24 hours',
      'Zero payout errors resulting in chargebacks'
    ]
  },

  // ============================================
  // CREATOR SUPPORT
  // ============================================

  SUPPORT_SPECIALIST: {
    id: 'support-specialist',
    title: 'Creator Support Specialist',
    department: 'Creator Support',
    level: 'entry',
    accessProfile: 'SUPPORT_SPECIALIST',
    salary: {
      min: 42000,
      max: 58000,
      currency: 'USD'
    },
    responsibilities: [
      'Respond to creator support tickets via email, chat, and phone',
      'Troubleshoot technical issues and account problems',
      'Guide creators through platform features',
      'Process account updates and profile changes',
      'Escalate complex issues to senior support or specialists',
      'Maintain positive creator relationships',
      'Document common issues and solutions',
      'Meet response time and satisfaction SLAs'
    ],
    requirements: [
      'High school diploma (Bachelor\'s preferred)',
      '1-2 years customer support experience',
      'Excellent written and verbal communication',
      'Strong problem-solving abilities',
      'Tech-savvy with ability to learn new platforms quickly',
      'Patient and empathetic customer service approach',
      'Comfortable discussing adult content professionally'
    ],
    niceToHave: [
      'Experience in creator economy or gig platforms',
      'Social media management experience',
      'Bilingual (Spanish, Portuguese, French)',
      'Basic HTML/CSS knowledge',
      'Previous chat support experience'
    ],
    benefits: [
      'Health, dental, vision insurance',
      '401(k) with 4% match',
      'PTO (15 days/year)',
      'Remote work',
      'Home office stipend ($500)',
      'Career advancement opportunities'
    ],
    onboardingDuration: 10,
    probationPeriod: 90,
    reportsTo: 'Support Manager',
    remotePolicy: 'remote',
    travelRequired: 'None',
    trainingModules: [
      'Platform Features & Navigation',
      'Creator Verification Process',
      'Payment & Payout Systems',
      'Content Upload & Management',
      'Effective Communication Skills',
      'De-escalation Techniques',
      'Adult Industry Basics'
    ],
    kpis: [
      'First response time < 2 hours',
      'Average resolution time < 24 hours',
      'Creator satisfaction score > 4.5/5',
      'Ticket volume: 40-60 tickets/day',
      'Escalation rate < 10%'
    ]
  },

  SUPPORT_MANAGER: {
    id: 'support-manager',
    title: 'Creator Support Manager',
    department: 'Creator Support',
    level: 'senior',
    accessProfile: 'SUPPORT_MANAGER',
    salary: {
      min: 85000,
      max: 115000,
      currency: 'USD'
    },
    responsibilities: [
      'Manage support team (10-15 specialists)',
      'Handle escalated creator issues and VIP accounts',
      'Develop support processes and documentation',
      'Monitor team performance and provide coaching',
      'Analyze support metrics and identify trends',
      'Collaborate with product team on feature requests',
      'Manage support tools and systems',
      'Create training materials for new hires'
    ],
    requirements: [
      'Bachelor\'s degree in Business or related field',
      '4+ years customer support experience (2+ managing teams)',
      'Strong leadership and coaching abilities',
      'Experience with support ticketing systems (Zendesk, Intercom)',
      'Data-driven decision making skills',
      'Excellent communication and interpersonal skills'
    ],
    niceToHave: [
      'Experience in adult industry or creator platforms',
      'Project management certification',
      'Experience with CRM systems',
      'Background in training and development',
      'Knowledge of creator economy trends'
    ],
    benefits: [
      'Comprehensive health benefits',
      '401(k) with 5% match',
      'Unlimited PTO',
      'Remote work',
      'Professional development budget ($3,000/year)',
      'Annual bonus (10-15%)'
    ],
    onboardingDuration: 21,
    probationPeriod: 90,
    reportsTo: 'COO',
    teamSize: 12,
    remotePolicy: 'remote',
    travelRequired: 'Quarterly team meetings',
    trainingModules: [
      'Leadership Development',
      'Performance Management',
      'Conflict Resolution',
      'Support Metrics & Analytics',
      'Team Building',
      'Advanced Platform Knowledge'
    ],
    kpis: [
      'Team CSAT score > 4.5/5',
      'Average first response time < 2 hours',
      'Team utilization > 85%',
      'Employee retention > 90%',
      'Escalation resolution < 48 hours'
    ]
  },

  // ============================================
  // MARKETING TEAM
  // ============================================

  MARKETING_COORDINATOR: {
    id: 'marketing-coordinator',
    title: 'Marketing Coordinator',
    department: 'Marketing',
    level: 'entry',
    accessProfile: 'MARKETING_COORDINATOR',
    salary: {
      min: 48000,
      max: 65000,
      currency: 'USD'
    },
    responsibilities: [
      'Execute email marketing campaigns to creators',
      'Manage social media content calendar',
      'Create marketing materials and graphics',
      'Track campaign performance and metrics',
      'Coordinate creator outreach programs',
      'Assist with influencer partnerships',
      'Maintain marketing database and CRM',
      'Support marketing manager with ad-hoc projects'
    ],
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      '1-2 years marketing experience',
      'Strong writing and editing skills',
      'Basic graphic design skills (Canva, Adobe Suite)',
      'Experience with email marketing platforms',
      'Social media savvy',
      'Organized with strong project management skills'
    ],
    niceToHave: [
      'Experience marketing to creators or influencers',
      'Knowledge of adult industry marketing regulations',
      'Google Analytics certification',
      'Video editing skills',
      'Experience with marketing automation tools'
    ],
    benefits: [
      'Health, dental, vision insurance',
      '401(k) with 4% match',
      'PTO (18 days/year)',
      'Hybrid/remote options',
      'Creative software subscriptions',
      'Marketing conference attendance'
    ],
    onboardingDuration: 10,
    probationPeriod: 90,
    reportsTo: 'Marketing Manager',
    remotePolicy: 'hybrid',
    travelRequired: 'Occasional (conferences)',
    trainingModules: [
      'FANZ Brand Guidelines',
      'Email Marketing Best Practices',
      'Social Media Strategy',
      'Analytics & Reporting',
      'Creator Personas',
      'Adult Industry Marketing Compliance'
    ],
    kpis: [
      'Email open rate > 25%',
      'Campaign click-through rate > 5%',
      'Social media engagement growth > 10%/month',
      'Campaign completion on time 100%'
    ]
  },

  // ============================================
  // TECHNOLOGY TEAM
  // ============================================

  SOFTWARE_DEVELOPER: {
    id: 'software-developer',
    title: 'Full-Stack Software Developer',
    department: 'Technology',
    level: 'mid',
    accessProfile: 'DEVELOPER',
    salary: {
      min: 95000,
      max: 145000,
      currency: 'USD'
    },
    responsibilities: [
      'Develop and maintain FANZ platform features',
      'Build RESTful APIs and microservices',
      'Implement frontend components with React/TypeScript',
      'Write clean, tested, and documented code',
      'Participate in code reviews and pair programming',
      'Debug and resolve production issues',
      'Optimize application performance',
      'Collaborate with product and design teams'
    ],
    requirements: [
      'Bachelor\'s degree in Computer Science or equivalent experience',
      '3-5 years software development experience',
      'Strong TypeScript/JavaScript skills',
      'Experience with React, Node.js, Express',
      'PostgreSQL or similar database experience',
      'Git version control proficiency',
      'Understanding of RESTful API design',
      'Strong problem-solving and debugging skills'
    ],
    niceToHave: [
      'Experience with payment processing integrations',
      'Knowledge of video streaming and CDN',
      'Microservices architecture experience',
      'AWS or cloud platform experience',
      'Previous work in creator economy or adult tech',
      'Open source contributions'
    ],
    benefits: [
      'Comprehensive health benefits',
      '401(k) with 5% match',
      'Unlimited PTO',
      'Fully remote',
      'Top-tier tech setup ($3,000 budget)',
      'Annual learning budget ($5,000)',
      'Stock options',
      'Annual bonus (5-15%)'
    ],
    onboardingDuration: 14,
    probationPeriod: 90,
    reportsTo: 'CTO',
    teamSize: 8,
    remotePolicy: 'remote',
    travelRequired: 'Quarterly team offsites',
    trainingModules: [
      'FANZ Architecture Overview',
      'Development Workflow & Git',
      'Security Best Practices',
      'Payment Systems Integration',
      'Platform APIs & Services',
      'Testing & QA Processes'
    ],
    kpis: [
      'Code review turnaround < 24 hours',
      'Zero critical bugs introduced',
      'Sprint velocity consistency',
      'Test coverage > 80%',
      'On-time feature delivery > 90%'
    ]
  },

  PLATFORM_MANAGER: {
    id: 'platform-manager',
    title: 'Platform Manager',
    department: 'Technology',
    level: 'senior',
    accessProfile: 'PLATFORM_MANAGER',
    salary: {
      min: 110000,
      max: 150000,
      currency: 'USD'
    },
    responsibilities: [
      'Manage configuration of 94 FANZ platforms',
      'Oversee platform integrations and APIs',
      'Monitor platform health and performance',
      'Coordinate platform launches and migrations',
      'Work with creators on platform-specific features',
      'Manage platform analytics and reporting',
      'Troubleshoot platform technical issues',
      'Develop platform roadmap with product team'
    ],
    requirements: [
      'Bachelor\'s degree in Computer Science, IT, or related field',
      '5+ years experience managing technical platforms',
      'Strong understanding of web technologies and APIs',
      'Experience with analytics and monitoring tools',
      'Project management skills',
      'Excellent communication and documentation skills'
    ],
    niceToHave: [
      'Experience with multi-tenant platforms',
      'Knowledge of adult industry platforms',
      'SQL and data analysis skills',
      'Technical writing background',
      'Experience with white-label platforms'
    ],
    benefits: [
      'Full health benefits',
      '401(k) with 5% match',
      'Unlimited PTO',
      'Remote work',
      'Professional development ($4,000/year)',
      'Annual bonus (10-20%)'
    ],
    onboardingDuration: 21,
    probationPeriod: 90,
    reportsTo: 'CTO',
    remotePolicy: 'remote',
    travelRequired: 'Quarterly',
    trainingModules: [
      'Platform Architecture Deep Dive',
      'Analytics & Monitoring',
      'API Management',
      'Platform Configuration',
      'Incident Response',
      'Technical Project Management'
    ],
    kpis: [
      'Platform uptime > 99.9%',
      'Average response time < 200ms',
      'Zero data breaches',
      'Platform launch success rate 100%'
    ]
  },
};

/**
 * Get job template by ID
 */
export function getJobTemplate(jobId: string): JobDescriptionTemplate | undefined {
  return JOB_TEMPLATES[jobId];
}

/**
 * Get all job templates for a department
 */
export function getJobTemplatesByDepartment(department: string): JobDescriptionTemplate[] {
  return Object.values(JOB_TEMPLATES).filter(job => job.department === department);
}

/**
 * Get all job templates by level
 */
export function getJobTemplatesByLevel(level: string): JobDescriptionTemplate[] {
  return Object.values(JOB_TEMPLATES).filter(job => job.level === level);
}

/**
 * Get recommended access profile for a job
 */
export function getJobAccessProfile(jobId: string): AccessProfile | undefined {
  const job = JOB_TEMPLATES[jobId];
  if (!job) return undefined;
  return ACCESS_PROFILES[job.accessProfile];
}
