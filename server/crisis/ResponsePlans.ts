/**
 * FANZ Incident Response Plan Templates
 * Pre-configured response plans for various crisis scenarios
 */

import { ResponsePlan, CrisisType, SeverityLevel } from './CrisisTypes';

export const RESPONSE_PLANS: Record<string, ResponsePlan> = {
  // ============================================
  // SECURITY INCIDENTS
  // ============================================

  DATA_BREACH: {
    id: 'rp-data-breach',
    name: 'Data Breach Response Plan',
    crisisType: CrisisType.DATA_BREACH,
    severity: SeverityLevel.CRITICAL,
    description: 'Response plan for unauthorized data access or exfiltration',
    lastUpdated: new Date('2025-11-01'),
    owner: 'Chief Security Officer',
    activationCriteria: [
      'Confirmed unauthorized access to creator or user data',
      'Evidence of data exfiltration',
      'Compromise of encryption keys',
      'Database credentials leaked'
    ],
    autoActivate: true,
    responseTeam: [
      {
        role: 'Incident Commander',
        responsibilities: ['Overall coordination', 'Executive updates', 'Final decisions'],
        contactInfo: 'cso@fanz.com, +1-555-0100',
        backup: 'CTO'
      },
      {
        role: 'Security Lead',
        responsibilities: ['Technical investigation', 'Containment actions', 'Evidence preservation'],
        contactInfo: 'security@fanz.com',
        backup: 'Senior Security Engineer'
      },
      {
        role: 'Legal Counsel',
        responsibilities: ['Legal obligations', 'Regulatory notifications', 'Liability assessment'],
        contactInfo: 'legal@fanz.com',
        backup: 'External Counsel'
      },
      {
        role: 'Privacy Officer',
        responsibilities: ['GDPR compliance', 'User notifications', 'Breach reporting'],
        contactInfo: 'privacy@fanz.com'
      },
      {
        role: 'Communications Lead',
        responsibilities: ['Creator/user communications', 'Media handling', 'Internal comms'],
        contactInfo: 'pr@fanz.com'
      }
    ],
    immediateActions: [
      {
        priority: 1,
        action: 'Activate Incident Command Center and assemble response team',
        assignedRole: 'Incident Commander',
        estimatedMinutes: 5
      },
      {
        priority: 2,
        action: 'Isolate affected systems to prevent further data access',
        assignedRole: 'Security Lead',
        estimatedMinutes: 10
      },
      {
        priority: 3,
        action: 'Preserve all logs and evidence for forensic analysis',
        assignedRole: 'Security Lead',
        estimatedMinutes: 10
      },
      {
        priority: 4,
        action: 'Identify scope: what data, how many users, what timeframe',
        assignedRole: 'Security Lead',
        estimatedMinutes: 15
      },
      {
        priority: 5,
        action: 'Notify CEO, CTO, Legal immediately',
        assignedRole: 'Incident Commander',
        estimatedMinutes: 5
      }
    ],
    shortTermActions: [
      {
        priority: 1,
        action: 'Conduct forensic analysis to determine attack vector',
        assignedRole: 'Security Lead',
        estimatedMinutes: 60
      },
      {
        priority: 2,
        action: 'Patch vulnerability or close attack vector',
        assignedRole: 'Security Lead',
        estimatedMinutes: 30
      },
      {
        priority: 3,
        action: 'Determine regulatory notification requirements (GDPR 72h, state laws)',
        assignedRole: 'Legal Counsel',
        estimatedMinutes: 30
      },
      {
        priority: 4,
        action: 'Draft initial internal communication',
        assignedRole: 'Communications Lead',
        estimatedMinutes: 20
      },
      {
        priority: 5,
        action: 'Assess if credit monitoring should be offered',
        assignedRole: 'Legal Counsel',
        estimatedMinutes: 30
      }
    ],
    ongoingActions: [
      {
        action: 'Update response team every hour',
        frequency: 'Hourly',
        assignedRole: 'Incident Commander'
      },
      {
        action: 'Monitor for signs of data appearing on dark web',
        frequency: 'Continuous',
        assignedRole: 'Security Lead'
      },
      {
        action: 'Coordinate with law enforcement if criminal activity',
        frequency: 'As needed',
        assignedRole: 'Legal Counsel'
      }
    ],
    communicationPlan: [
      {
        audience: 'Executive Team',
        timing: 'Within 15 minutes of detection',
        channel: 'Phone + Slack',
        template: 'executive-breach-alert',
        approvalRequired: false
      },
      {
        audience: 'Affected Creators/Users',
        timing: 'Within 72 hours (GDPR requirement)',
        channel: 'Email',
        template: 'user-breach-notification',
        approvalRequired: true,
        approver: 'CEO + Legal'
      },
      {
        audience: 'All Creators/Users',
        timing: 'After affected users notified',
        channel: 'Email + Platform',
        template: 'general-security-update',
        approvalRequired: true,
        approver: 'CEO'
      },
      {
        audience: 'Regulators (if required)',
        timing: 'Within 72 hours of detection',
        channel: 'Official filing',
        template: 'regulator-breach-report',
        approvalRequired: true,
        approver: 'Legal + CEO'
      },
      {
        audience: 'Media/Public',
        timing: 'Only if required or going public',
        channel: 'Press release',
        template: 'press-breach-statement',
        approvalRequired: true,
        approver: 'CEO + Board'
      }
    ],
    escalationPath: [
      {
        level: 1,
        trigger: 'Initial detection',
        notifyRoles: ['CSO', 'CTO'],
        additionalActions: ['Activate response team']
      },
      {
        level: 2,
        trigger: '>1000 users affected OR sensitive data (SSN, financial)',
        notifyRoles: ['CEO', 'CFO', 'Legal'],
        additionalActions: ['Engage external forensics firm', 'Notify insurance']
      },
      {
        level: 3,
        trigger: '>10,000 users affected OR major media coverage likely',
        notifyRoles: ['Board of Directors'],
        additionalActions: ['Engage crisis PR firm', 'Legal counsel on retainer']
      }
    ],
    requiredResources: [
      'Forensic analysis tools',
      'External cybersecurity firm contact',
      'Cyber insurance policy details',
      'Legal breach notification templates',
      'Credit monitoring service vendor'
    ],
    contacts: [
      {
        name: 'FBI Cyber Crimes',
        role: 'Law Enforcement',
        phone: '1-855-292-3937',
        email: 'ic3@fbi.gov',
        availability: '24/7'
      },
      {
        name: 'Mandiant (FireEye)',
        role: 'Forensics Partner',
        phone: '1-888-227-2721',
        email: 'info@mandiant.com',
        availability: '24/7 Emergency'
      },
      {
        name: 'External Legal Counsel',
        role: 'Breach Notification Attorney',
        phone: 'TBD',
        email: 'TBD',
        availability: 'On-call'
      }
    ],
    resolutionCriteria: [
      'Attack vector identified and closed',
      'All affected systems secured',
      'Full scope of breach determined',
      'All required notifications completed',
      'Forensic report completed',
      'Preventive measures implemented'
    ],
    postCrisisActions: [
      'Conduct full security audit',
      'Implement lessons learned',
      'Update security policies',
      'Employee security training',
      'Review and update this response plan'
    ],
    documentationRequirements: [
      'Incident timeline (minute-by-minute)',
      'Forensic analysis report',
      'All communications sent',
      'Regulatory filings',
      'Post-mortem report'
    ]
  },

  CSAM_DETECTION: {
    id: 'rp-csam',
    name: 'CSAM Detection Response Plan',
    crisisType: CrisisType.CSAM_DETECTION,
    severity: SeverityLevel.CRITICAL,
    description: 'Immediate response to Child Sexual Abuse Material detection',
    lastUpdated: new Date('2025-11-01'),
    owner: 'Chief Compliance Officer',
    activationCriteria: [
      'Automated CSAM detection alert',
      'Manual report of suspected CSAM',
      'NCMEC match notification'
    ],
    autoActivate: true,
    responseTeam: [
      {
        role: 'Compliance Lead',
        responsibilities: ['Immediate content review', 'NCMEC reporting', 'Evidence preservation'],
        contactInfo: 'compliance@fanz.com'
      },
      {
        role: 'Legal Counsel',
        responsibilities: ['Law enforcement coordination', 'Legal obligations'],
        contactInfo: 'legal@fanz.com'
      },
      {
        role: 'Security Lead',
        responsibilities: ['Account suspension', 'IP/device tracking', 'Evidence collection'],
        contactInfo: 'security@fanz.com'
      }
    ],
    immediateActions: [
      {
        priority: 1,
        action: 'IMMEDIATELY remove content from all platforms',
        assignedRole: 'Compliance Lead',
        estimatedMinutes: 2
      },
      {
        priority: 2,
        action: 'Suspend associated account(s) pending investigation',
        assignedRole: 'Compliance Lead',
        estimatedMinutes: 2
      },
      {
        priority: 3,
        action: 'Preserve all evidence (content, metadata, logs, IP addresses)',
        assignedRole: 'Security Lead',
        estimatedMinutes: 5
      },
      {
        priority: 4,
        action: 'File NCMEC CyberTipline report (REQUIRED within 24 hours)',
        assignedRole: 'Compliance Lead',
        estimatedMinutes: 30
      },
      {
        priority: 5,
        action: 'Notify CCO and Legal immediately',
        assignedRole: 'Compliance Lead',
        estimatedMinutes: 5
      }
    ],
    shortTermActions: [
      {
        priority: 1,
        action: 'Review all content from same account',
        assignedRole: 'Compliance Lead',
        estimatedMinutes: 60
      },
      {
        priority: 2,
        action: 'Check for connected accounts or collaborators',
        assignedRole: 'Security Lead',
        estimatedMinutes: 30
      },
      {
        priority: 3,
        action: 'Determine if law enforcement should be contacted directly',
        assignedRole: 'Legal Counsel',
        estimatedMinutes: 30
      },
      {
        priority: 4,
        action: 'Document full incident report',
        assignedRole: 'Compliance Lead',
        estimatedMinutes: 45
      }
    ],
    ongoingActions: [
      {
        action: 'Monitor NCMEC case status',
        frequency: 'Daily until closed',
        assignedRole: 'Compliance Lead'
      },
      {
        action: 'Cooperate with law enforcement investigation',
        frequency: 'As requested',
        assignedRole: 'Legal Counsel'
      }
    ],
    communicationPlan: [
      {
        audience: 'NCMEC',
        timing: 'Within 24 hours of detection',
        channel: 'CyberTipline',
        template: 'ncmec-report',
        approvalRequired: false
      },
      {
        audience: 'Law Enforcement',
        timing: 'If requested or mandated',
        channel: 'Direct contact',
        template: 'law-enforcement-report',
        approvalRequired: true,
        approver: 'Legal'
      },
      {
        audience: 'Executive Team',
        timing: 'Within 1 hour',
        channel: 'Confidential email',
        template: 'executive-csam-alert',
        approvalRequired: false
      }
    ],
    escalationPath: [
      {
        level: 1,
        trigger: 'Any CSAM detection',
        notifyRoles: ['CCO', 'Legal'],
        additionalActions: ['File NCMEC report']
      },
      {
        level: 2,
        trigger: 'Multiple incidents or organized activity',
        notifyRoles: ['CEO', 'Board'],
        additionalActions: ['Contact FBI directly', 'Enhanced monitoring']
      }
    ],
    requiredResources: [
      'NCMEC CyberTipline access',
      'PhotoDNA / hashing database',
      'Evidence preservation system',
      'Legal counsel contact info'
    ],
    contacts: [
      {
        name: 'NCMEC CyberTipline',
        role: 'Required Reporting',
        phone: '1-800-843-5678',
        email: 'www.cybertipline.org',
        availability: '24/7'
      },
      {
        name: 'FBI Violent Crimes Against Children',
        role: 'Law Enforcement',
        phone: '1-800-CALL-FBI',
        email: 'tips.fbi.gov',
        availability: '24/7'
      }
    ],
    resolutionCriteria: [
      'Content permanently removed',
      'NCMEC report filed',
      'All evidence preserved',
      'Account permanently banned',
      'Related accounts investigated',
      'Law enforcement cooperation completed (if applicable)'
    ],
    postCrisisActions: [
      'Review detection systems effectiveness',
      'Update filtering algorithms',
      'Team trauma support/counseling',
      'Process improvements documented'
    ],
    documentationRequirements: [
      'NCMEC filing confirmation',
      'Evidence preservation log',
      'Incident timeline',
      'Law enforcement correspondence (if applicable)',
      'Process improvement recommendations'
    ]
  },

  PLATFORM_OUTAGE: {
    id: 'rp-platform-outage',
    name: 'Platform Outage Response Plan',
    crisisType: CrisisType.PLATFORM_OUTAGE,
    severity: SeverityLevel.HIGH,
    description: 'Response to platform downtime or degraded service',
    lastUpdated: new Date('2025-11-01'),
    owner: 'CTO',
    activationCriteria: [
      'Platform unavailable for >5 minutes',
      'Error rate exceeds 10%',
      '>1000 user complaints in 15 minutes',
      'Critical feature failure'
    ],
    autoActivate: true,
    responseTeam: [
      {
        role: 'Incident Commander',
        responsibilities: ['Overall coordination', 'Decisions on rollback/fixes'],
        contactInfo: 'cto@fanz.com',
        backup: 'Engineering Manager'
      },
      {
        role: 'Engineering Lead',
        responsibilities: ['Technical diagnosis', 'Implement fixes', 'Monitor systems'],
        contactInfo: 'engineering@fanz.com'
      },
      {
        role: 'Platform Manager',
        responsibilities: ['Impact assessment', 'Creator communication'],
        contactInfo: 'platform@fanz.com'
      },
      {
        role: 'Support Lead',
        responsibilities: ['User communications', 'Ticket triage'],
        contactInfo: 'support@fanz.com'
      }
    ],
    immediateActions: [
      {
        priority: 1,
        action: 'Post status page update: "Investigating issue"',
        assignedRole: 'Platform Manager',
        estimatedMinutes: 2
      },
      {
        priority: 2,
        action: 'Assemble engineering team war room',
        assignedRole: 'Incident Commander',
        estimatedMinutes: 5
      },
      {
        priority: 3,
        action: 'Check monitoring dashboards for errors/metrics',
        assignedRole: 'Engineering Lead',
        estimatedMinutes: 3
      },
      {
        priority: 4,
        action: 'Identify affected platforms and features',
        assignedRole: 'Platform Manager',
        estimatedMinutes: 5
      },
      {
        priority: 5,
        action: 'Disable non-critical features if needed to reduce load',
        assignedRole: 'Engineering Lead',
        estimatedMinutes: 10
      }
    ],
    shortTermActions: [
      {
        priority: 1,
        action: 'Diagnose root cause (database, API, CDN, etc)',
        assignedRole: 'Engineering Lead',
        estimatedMinutes: 30
      },
      {
        priority: 2,
        action: 'Implement fix or rollback recent deployment',
        assignedRole: 'Engineering Lead',
        estimatedMinutes: 30
      },
      {
        priority: 3,
        action: 'Test fix in staging before production deploy',
        assignedRole: 'Engineering Lead',
        estimatedMinutes: 15
      },
      {
        priority: 4,
        action: 'Update status page with progress every 15 minutes',
        assignedRole: 'Platform Manager',
        estimatedMinutes: 5
      },
      {
        priority: 5,
        action: 'Notify major creators directly if >30min outage',
        assignedRole: 'Support Lead',
        estimatedMinutes: 20
      }
    ],
    ongoingActions: [
      {
        action: 'Monitor system health metrics',
        frequency: 'Continuous',
        assignedRole: 'Engineering Lead'
      },
      {
        action: 'Update status page',
        frequency: 'Every 15 minutes',
        assignedRole: 'Platform Manager'
      },
      {
        action: 'War room updates',
        frequency: 'Every 30 minutes',
        assignedRole: 'Incident Commander'
      }
    ],
    communicationPlan: [
      {
        audience: 'Public Status Page',
        timing: 'Within 5 minutes',
        channel: 'status.fanz.com',
        template: 'outage-investigating',
        approvalRequired: false
      },
      {
        audience: 'Internal Team',
        timing: 'Immediately',
        channel: 'Slack #incidents',
        template: 'internal-outage-alert',
        approvalRequired: false
      },
      {
        audience: 'All Creators (if >30min)',
        timing: 'Every 30 minutes',
        channel: 'Email + Dashboard banner',
        template: 'creator-outage-update',
        approvalRequired: false
      },
      {
        audience: 'Social Media',
        timing: 'If >1 hour or viral complaints',
        channel: 'Twitter',
        template: 'social-outage-statement',
        approvalRequired: true,
        approver: 'CTO'
      }
    ],
    escalationPath: [
      {
        level: 1,
        trigger: 'Outage detected',
        notifyRoles: ['CTO', 'Engineering Manager'],
        additionalActions: ['Activate war room']
      },
      {
        level: 2,
        trigger: 'Outage >30 minutes',
        notifyRoles: ['CEO', 'CFO'],
        additionalActions: ['External status updates', 'Creator direct communication']
      },
      {
        level: 3,
        trigger: 'Outage >2 hours OR revenue-impacting',
        notifyRoles: ['Board of Directors'],
        additionalActions: ['Consider credit/refunds', 'PR crisis plan']
      }
    ],
    requiredResources: [
      'Monitoring dashboards (DataDog, New Relic)',
      'Status page (status.fanz.com)',
      'On-call schedule',
      'Rollback procedures',
      'Cloud provider support contacts'
    ],
    contacts: [
      {
        name: 'AWS Support',
        role: 'Infrastructure',
        phone: '1-877-742-2121',
        email: 'Enterprise support portal',
        availability: '24/7 Premium Support'
      },
      {
        name: 'Cloudflare Support',
        role: 'CDN',
        phone: '+1-888-993-5273',
        email: 'Enterprise support',
        availability: '24/7'
      }
    ],
    resolutionCriteria: [
      'All platforms operational',
      'Error rates back to normal (<0.1%)',
      'No degraded performance',
      'Root cause identified',
      'Status page updated to "Resolved"'
    ],
    postCrisisActions: [
      'Post-mortem meeting within 48 hours',
      'Update monitoring/alerts if needed',
      'Implement preventive measures',
      'Update runbooks',
      'Consider creator credits if extended outage'
    ],
    documentationRequirements: [
      'Incident timeline',
      'Root cause analysis',
      'All status page updates',
      'Post-mortem report',
      'Action items for prevention'
    ]
  },

  PAYMENT_PROCESSOR_SUSPENSION: {
    id: 'rp-payment-suspension',
    name: 'Payment Processor Suspension Response',
    crisisType: CrisisType.PAYMENT_PROCESSOR_SUSPENSION,
    severity: SeverityLevel.CRITICAL,
    description: 'Response to payment processor account suspension or termination',
    lastUpdated: new Date('2025-11-01'),
    owner: 'CFO',
    activationCriteria: [
      'Paxum account suspended',
      'Cosmo Payment account terminated',
      'ACH processing disabled',
      'Cannot process creator payouts'
    ],
    autoActivate: true,
    responseTeam: [
      {
        role: 'Finance Lead',
        responsibilities: ['Processor communication', 'Alternative activation', 'Creator payouts'],
        contactInfo: 'cfo@fanz.com'
      },
      {
        role: 'Legal Counsel',
        responsibilities: ['Contract review', 'Dispute resolution', 'Compliance verification'],
        contactInfo: 'legal@fanz.com'
      },
      {
        role: 'Compliance Lead',
        responsibilities: ['Address violations', 'Provide documentation', 'Remediation'],
        contactInfo: 'compliance@fanz.com'
      }
    ],
    immediateActions: [
      {
        priority: 1,
        action: 'Contact processor immediately to understand reason',
        assignedRole: 'Finance Lead',
        estimatedMinutes: 15
      },
      {
        priority: 2,
        action: 'Activate backup payment processor',
        assignedRole: 'Finance Lead',
        estimatedMinutes: 30
      },
      {
        priority: 3,
        action: 'Halt all outgoing payouts until alternative secured',
        assignedRole: 'Finance Lead',
        estimatedMinutes: 5
      },
      {
        priority: 4,
        action: 'Assess funds at risk (pending payouts, held balances)',
        assignedRole: 'Finance Lead',
        estimatedMinutes: 20
      },
      {
        priority: 5,
        action: 'Notify CEO and Board immediately',
        assignedRole: 'Finance Lead',
        estimatedMinutes: 10
      }
    ],
    shortTermActions: [
      {
        priority: 1,
        action: 'Provide all requested documentation to processor',
        assignedRole: 'Compliance Lead',
        estimatedMinutes: 120
      },
      {
        priority: 2,
        action: 'Legal review of processor agreement and termination clauses',
        assignedRole: 'Legal Counsel',
        estimatedMinutes: 60
      },
      {
        priority: 3,
        action: 'Set up alternative payout method for creators',
        assignedRole: 'Finance Lead',
        estimatedMinutes: 180
      },
      {
        priority: 4,
        action: 'Draft creator communication about payout delays',
        assignedRole: 'Finance Lead',
        estimatedMinutes: 30
      }
    ],
    ongoingActions: [
      {
        action: 'Daily check-ins with processor account manager',
        frequency: 'Daily',
        assignedRole: 'Finance Lead'
      },
      {
        action: 'Monitor creator concerns and provide updates',
        frequency: 'Continuous',
        assignedRole: 'Support Lead'
      }
    ],
    communicationPlan: [
      {
        audience: 'Creators expecting payouts',
        timing: 'Within 24 hours',
        channel: 'Email',
        template: 'payout-delay-notice',
        approvalRequired: true,
        approver: 'CFO'
      },
      {
        audience: 'All Creators',
        timing: 'If resolution takes >1 week',
        channel: 'Platform announcement',
        template: 'payment-processor-update',
        approvalRequired: true,
        approver: 'CEO'
      }
    ],
    escalationPath: [
      {
        level: 1,
        trigger: 'Initial suspension',
        notifyRoles: ['CFO', 'Legal', 'Compliance'],
        additionalActions: ['Activate backup processor']
      },
      {
        level: 2,
        trigger: 'Cannot resolve within 48 hours',
        notifyRoles: ['CEO', 'Board'],
        additionalActions: ['Explore wire transfer alternatives', 'Legal action consideration']
      }
    ],
    requiredResources: [
      'Backup payment processor contracts',
      'Adult industry payment processor contacts',
      'Legal counsel specializing in payment processing',
      'Creator payout database'
    ],
    contacts: [
      {
        name: 'Paxum Account Manager',
        role: 'Primary Processor',
        phone: '+1-866-945-4296',
        email: 'support@paxum.com',
        availability: 'Business hours'
      },
      {
        name: 'Cosmo Payment',
        role: 'Backup Processor',
        phone: '+44-203-769-8888',
        email: 'support@cosmopayment.com',
        availability: 'Business hours'
      }
    ],
    resolutionCriteria: [
      'Account reinstated OR alternative activated',
      'All pending payouts processed',
      'Normal payout operations resumed',
      'Reserve funds released (if applicable)'
    ],
    postCrisisActions: [
      'Diversify payment processor relationships',
      'Review compliance procedures',
      'Update creator payout SLAs',
      'Establish better processor redundancy'
    ],
    documentationRequirements: [
      'Suspension notice from processor',
      'All correspondence with processor',
      'Resolution timeline',
      'Impact on creator payouts',
      'Lessons learned document'
    ]
  }
};

/**
 * Get response plan by crisis type
 */
export function getResponsePlan(crisisType: CrisisType): ResponsePlan | undefined {
  const planId = `rp-${crisisType.replace(/_/g, '-')}`;
  return Object.values(RESPONSE_PLANS).find(plan => plan.id === planId || plan.crisisType === crisisType);
}

/**
 * Get all response plans
 */
export function getAllResponsePlans(): ResponsePlan[] {
  return Object.values(RESPONSE_PLANS);
}

/**
 * Get response plans by severity
 */
export function getResponsePlansBySeverity(severity: SeverityLevel): ResponsePlan[] {
  return Object.values(RESPONSE_PLANS).filter(plan => plan.severity === severity);
}
