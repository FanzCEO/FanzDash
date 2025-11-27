import { EventEmitter } from 'events';

/**
 * Enterprise HR Compliance Manager
 *
 * Handles compliance for:
 * - Federal Laws (USA): FLSA, FMLA, ADA, OSHA, EEOC, WARN Act, etc.
 * - State Laws: Minimum wage, sick leave, workers comp, etc.
 * - International: GDPR, local labor laws, working time directives
 * - Industry: Adult entertainment specific regulations (18 USC 2257, etc.)
 */

export type ComplianceJurisdiction = 'federal_us' | 'state' | 'international' | 'industry' | 'local';
export type ComplianceStatus = 'compliant' | 'warning' | 'violation' | 'pending_review';
export type ComplianceCategory =
  | 'labor_law'
  | 'safety'
  | 'discrimination'
  | 'wage_hour'
  | 'benefits'
  | 'privacy'
  | 'training'
  | 'record_keeping'
  | 'workplace_safety'
  | 'environmental';

interface ComplianceRequirement {
  id: string;
  name: string;
  category: ComplianceCategory;
  jurisdiction: ComplianceJurisdiction;
  description: string;
  legalReference: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'as_needed' | 'continuous';
  responsible: string; // Role responsible
  lastCheck?: Date;
  nextCheck?: Date;
  status: ComplianceStatus;
  violations?: ComplianceViolation[];
  documentation?: string[];
  penalties?: string; // Potential penalties for non-compliance
  criticalityLevel: 'critical' | 'high' | 'medium' | 'low';
}

interface ComplianceViolation {
  id: string;
  requirementId: string;
  date: Date;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  remediation: string;
  remediationDeadline: Date;
  status: 'open' | 'in_progress' | 'resolved';
  reportedBy: string;
  assignedTo: string;
  resolutionDate?: Date;
  resolutionNotes?: string;
}

interface PolicyDocument {
  id: string;
  title: string;
  category: string;
  version: string;
  effectiveDate: Date;
  lastReviewed: Date;
  nextReview: Date;
  approvedBy: string;
  content: string;
  acknowledgmentRequired: boolean;
  acknowledgedBy: Set<string>; // Employee IDs
  relatedLaws: string[];
}

export class ComplianceManager extends EventEmitter {
  private requirements: Map<string, ComplianceRequirement> = new Map();
  private violations: Map<string, ComplianceViolation> = new Map();
  private policies: Map<string, PolicyDocument> = new Map();
  private auditLog: any[] = [];

  constructor() {
    super();
    this.initializeFederalCompliance();
    this.initializeStateCompliance();
    this.initializeInternationalCompliance();
    this.initializeIndustryCompliance();
    this.initializePolicies();
    this.startComplianceMonitoring();
    console.log('🏛️ HR Compliance Manager initialized');
  }

  // ============ FEDERAL US COMPLIANCE ============

  private initializeFederalCompliance(): void {
    const federalRequirements: Omit<ComplianceRequirement, 'id'>[] = [
      // FLSA - Fair Labor Standards Act
      {
        name: 'FLSA Minimum Wage Compliance',
        category: 'wage_hour',
        jurisdiction: 'federal_us',
        description: 'Ensure all employees paid at least federal minimum wage ($7.25/hr)',
        legalReference: '29 USC 206',
        frequency: 'continuous',
        responsible: 'Payroll Manager',
        status: 'compliant',
        penalties: 'Back wages, liquidated damages, fines up to $10,000',
        criticalityLevel: 'critical'
      },
      {
        name: 'FLSA Overtime Pay',
        category: 'wage_hour',
        jurisdiction: 'federal_us',
        description: 'Pay 1.5x rate for hours over 40/week for non-exempt employees',
        legalReference: '29 USC 207',
        frequency: 'continuous',
        responsible: 'Payroll Manager',
        status: 'compliant',
        penalties: 'Back wages, liquidated damages, criminal prosecution',
        criticalityLevel: 'critical'
      },
      {
        name: 'FLSA Child Labor',
        category: 'labor_law',
        jurisdiction: 'federal_us',
        description: 'No employment of minors in hazardous occupations, hour restrictions',
        legalReference: '29 USC 212',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Fines up to $10,000 per violation, criminal prosecution',
        criticalityLevel: 'critical'
      },

      // ADA - Americans with Disabilities Act
      {
        name: 'ADA Reasonable Accommodations',
        category: 'discrimination',
        jurisdiction: 'federal_us',
        description: 'Provide reasonable accommodations for qualified individuals with disabilities',
        legalReference: '42 USC 12111-12117',
        frequency: 'as_needed',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Compensatory damages, punitive damages up to $300,000',
        criticalityLevel: 'critical'
      },
      {
        name: 'ADA Accessibility Requirements',
        category: 'workplace_safety',
        jurisdiction: 'federal_us',
        description: 'Ensure workplace is accessible to individuals with disabilities',
        legalReference: '42 USC 12181-12189',
        frequency: 'annual',
        responsible: 'Facilities Manager',
        status: 'compliant',
        penalties: 'Civil penalties, injunctive relief',
        criticalityLevel: 'high'
      },

      // FMLA - Family and Medical Leave Act
      {
        name: 'FMLA Leave Entitlement',
        category: 'benefits',
        jurisdiction: 'federal_us',
        description: '12 weeks unpaid leave for qualified medical/family reasons',
        legalReference: '29 USC 2601-2654',
        frequency: 'as_needed',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Back pay, liquidated damages, reinstatement',
        criticalityLevel: 'high'
      },
      {
        name: 'FMLA Notice Requirements',
        category: 'record_keeping',
        jurisdiction: 'federal_us',
        description: 'Post FMLA rights notice, provide employee notices',
        legalReference: '29 CFR 825.300',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Fines, damages',
        criticalityLevel: 'medium'
      },

      // OSHA - Occupational Safety and Health Act
      {
        name: 'OSHA General Duty Clause',
        category: 'workplace_safety',
        jurisdiction: 'federal_us',
        description: 'Provide workplace free from recognized hazards',
        legalReference: '29 USC 654(a)(1)',
        frequency: 'continuous',
        responsible: 'Safety Officer',
        status: 'compliant',
        penalties: 'Citations, fines up to $70,000 per violation',
        criticalityLevel: 'critical'
      },
      {
        name: 'OSHA Recordkeeping (300 Log)',
        category: 'record_keeping',
        jurisdiction: 'federal_us',
        description: 'Maintain OSHA 300 log of work-related injuries and illnesses',
        legalReference: '29 CFR 1904',
        frequency: 'continuous',
        responsible: 'Safety Officer',
        status: 'compliant',
        penalties: 'Fines up to $15,625 per violation',
        criticalityLevel: 'high'
      },
      {
        name: 'OSHA Hazard Communication',
        category: 'workplace_safety',
        jurisdiction: 'federal_us',
        description: 'Maintain SDS sheets, label hazardous materials, train employees',
        legalReference: '29 CFR 1910.1200',
        frequency: 'continuous',
        responsible: 'Safety Officer',
        status: 'compliant',
        penalties: 'Serious citations, fines',
        criticalityLevel: 'high'
      },
      {
        name: 'OSHA Emergency Action Plan',
        category: 'workplace_safety',
        jurisdiction: 'federal_us',
        description: 'Written emergency action plan for fire, evacuation, etc.',
        legalReference: '29 CFR 1910.38',
        frequency: 'annual',
        responsible: 'Safety Officer',
        status: 'compliant',
        penalties: 'Citations, fines',
        criticalityLevel: 'high'
      },

      // Title VII - Civil Rights Act
      {
        name: 'Title VII Anti-Discrimination',
        category: 'discrimination',
        jurisdiction: 'federal_us',
        description: 'No discrimination based on race, color, religion, sex, national origin',
        legalReference: '42 USC 2000e',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Compensatory damages, punitive damages, reinstatement',
        criticalityLevel: 'critical'
      },
      {
        name: 'Sexual Harassment Prevention',
        category: 'discrimination',
        jurisdiction: 'federal_us',
        description: 'Prevent and address sexual harassment, maintain complaint procedures',
        legalReference: 'Title VII, EEOC Guidelines',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Damages, injunctive relief, reputational harm',
        criticalityLevel: 'critical'
      },

      // COBRA - Consolidated Omnibus Budget Reconciliation Act
      {
        name: 'COBRA Continuation Coverage',
        category: 'benefits',
        jurisdiction: 'federal_us',
        description: 'Offer continued health coverage after qualifying events',
        legalReference: '29 USC 1161-1168',
        frequency: 'as_needed',
        responsible: 'Benefits Administrator',
        status: 'compliant',
        penalties: 'Excise tax $100/day per affected individual',
        criticalityLevel: 'high'
      },

      // WARN Act - Worker Adjustment and Retraining Notification
      {
        name: 'WARN Act Mass Layoff Notice',
        category: 'labor_law',
        jurisdiction: 'federal_us',
        description: '60 days notice for mass layoffs or plant closings',
        legalReference: '29 USC 2101-2109',
        frequency: 'as_needed',
        responsible: 'HR Director',
        status: 'compliant',
        penalties: 'Back pay and benefits for 60 days',
        criticalityLevel: 'critical'
      },

      // I-9 Employment Eligibility
      {
        name: 'Form I-9 Verification',
        category: 'record_keeping',
        jurisdiction: 'federal_us',
        description: 'Verify employment eligibility for all employees',
        legalReference: '8 USC 1324a',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Fines $230-$2,292 per violation, criminal prosecution',
        criticalityLevel: 'critical'
      },
      {
        name: 'I-9 Retention Requirements',
        category: 'record_keeping',
        jurisdiction: 'federal_us',
        description: 'Retain I-9 forms for 3 years after hire or 1 year after termination',
        legalReference: '8 CFR 274a.2',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Fines, penalties',
        criticalityLevel: 'high'
      },

      // Equal Pay Act
      {
        name: 'Equal Pay for Equal Work',
        category: 'wage_hour',
        jurisdiction: 'federal_us',
        description: 'Equal pay for equal work regardless of sex',
        legalReference: '29 USC 206(d)',
        frequency: 'continuous',
        responsible: 'Compensation Manager',
        status: 'compliant',
        penalties: 'Back pay, liquidated damages',
        criticalityLevel: 'critical'
      },

      // ADEA - Age Discrimination in Employment Act
      {
        name: 'ADEA Age Discrimination',
        category: 'discrimination',
        jurisdiction: 'federal_us',
        description: 'No discrimination against employees 40+',
        legalReference: '29 USC 621-634',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Back pay, liquidated damages, reinstatement',
        criticalityLevel: 'critical'
      },

      // GINA - Genetic Information Nondiscrimination Act
      {
        name: 'GINA Genetic Information Protection',
        category: 'privacy',
        jurisdiction: 'federal_us',
        description: 'No discrimination based on genetic information',
        legalReference: '42 USC 2000ff',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Compensatory damages, punitive damages',
        criticalityLevel: 'high'
      },

      // ERISA - Employee Retirement Income Security Act
      {
        name: 'ERISA Benefit Plan Administration',
        category: 'benefits',
        jurisdiction: 'federal_us',
        description: 'Proper administration of employee benefit plans',
        legalReference: '29 USC 1001-1461',
        frequency: 'continuous',
        responsible: 'Benefits Administrator',
        status: 'compliant',
        penalties: 'Civil penalties, excise taxes, fiduciary liability',
        criticalityLevel: 'high'
      },

      // ACA - Affordable Care Act
      {
        name: 'ACA Employer Shared Responsibility',
        category: 'benefits',
        jurisdiction: 'federal_us',
        description: 'Offer affordable health insurance to full-time employees',
        legalReference: '26 USC 4980H',
        frequency: 'annual',
        responsible: 'Benefits Administrator',
        status: 'compliant',
        penalties: 'Employer Shared Responsibility Payment',
        criticalityLevel: 'high'
      },

      // HIPAA - Health Insurance Portability and Accountability Act
      {
        name: 'HIPAA Privacy and Security',
        category: 'privacy',
        jurisdiction: 'federal_us',
        description: 'Protect employee health information privacy',
        legalReference: '45 CFR 160, 164',
        frequency: 'continuous',
        responsible: 'Privacy Officer',
        status: 'compliant',
        penalties: 'Fines up to $1.5M per year, criminal penalties',
        criticalityLevel: 'critical'
      }
    ];

    federalRequirements.forEach((req, index) => {
      const id = `fed_${index + 1}`;
      this.requirements.set(id, { id, ...req } as ComplianceRequirement);
    });
  }

  // ============ STATE COMPLIANCE (Examples for multiple states) ============

  private initializeStateCompliance(): void {
    const stateRequirements: Omit<ComplianceRequirement, 'id'>[] = [
      // California
      {
        name: 'CA Meal and Rest Break Requirements',
        category: 'wage_hour',
        jurisdiction: 'state',
        description: '30-min meal break for 5+ hours, 10-min rest break per 4 hours',
        legalReference: 'CA Labor Code 512',
        frequency: 'continuous',
        responsible: 'Payroll Manager',
        status: 'compliant',
        penalties: '1 hour of pay per violation per day',
        criticalityLevel: 'high'
      },
      {
        name: 'CA Paid Sick Leave',
        category: 'benefits',
        jurisdiction: 'state',
        description: 'Minimum 24 hours or 3 days paid sick leave annually',
        legalReference: 'CA Labor Code 245-249',
        frequency: 'annual',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Back pay, penalties, injunctive relief',
        criticalityLevel: 'high'
      },
      {
        name: 'CA Sexual Harassment Training',
        category: 'training',
        jurisdiction: 'state',
        description: '2 hours for supervisors, 1 hour for employees (every 2 years)',
        legalReference: 'CA Govt Code 12950.1',
        frequency: 'as_needed',
        responsible: 'Training Manager',
        status: 'compliant',
        penalties: 'Liability in harassment claims',
        criticalityLevel: 'critical'
      },

      // New York
      {
        name: 'NY Minimum Wage (varies by region)',
        category: 'wage_hour',
        jurisdiction: 'state',
        description: 'Pay applicable minimum wage for region ($15-$16/hr)',
        legalReference: 'NY Labor Law 652',
        frequency: 'continuous',
        responsible: 'Payroll Manager',
        status: 'compliant',
        penalties: 'Back wages, liquidated damages, penalties',
        criticalityLevel: 'critical'
      },
      {
        name: 'NY Paid Family Leave',
        category: 'benefits',
        jurisdiction: 'state',
        description: 'Up to 12 weeks paid family leave',
        legalReference: 'NY Workers Comp Law 200-209',
        frequency: 'as_needed',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Civil penalties, damages',
        criticalityLevel: 'high'
      },

      // Texas
      {
        name: 'TX Workers Compensation Coverage',
        category: 'benefits',
        jurisdiction: 'state',
        description: 'Provide workers comp insurance or approved self-insurance',
        legalReference: 'TX Labor Code Title 5',
        frequency: 'continuous',
        responsible: 'Risk Manager',
        status: 'compliant',
        penalties: 'Administrative penalties, cease operations',
        criticalityLevel: 'critical'
      },

      // Massachusetts
      {
        name: 'MA Earned Sick Time',
        category: 'benefits',
        jurisdiction: 'state',
        description: '40 hours earned sick time per year',
        legalReference: 'MA Gen Laws ch. 149, 148C',
        frequency: 'annual',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Treble damages, attorney fees',
        criticalityLevel: 'high'
      },

      // Washington
      {
        name: 'WA Paid Sick Leave',
        category: 'benefits',
        jurisdiction: 'state',
        description: '1 hour per 40 hours worked',
        legalReference: 'WA RCW 49.46.210',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Back pay, penalties up to $1,000',
        criticalityLevel: 'high'
      }
    ];

    stateRequirements.forEach((req, index) => {
      const id = `state_${index + 1}`;
      this.requirements.set(id, { id, ...req } as ComplianceRequirement);
    });
  }

  // ============ INTERNATIONAL COMPLIANCE ============

  private initializeInternationalCompliance(): void {
    const intlRequirements: Omit<ComplianceRequirement, 'id'>[] = [
      // European Union
      {
        name: 'GDPR Data Protection',
        category: 'privacy',
        jurisdiction: 'international',
        description: 'Protect employee personal data, right to erasure, data portability',
        legalReference: 'EU Regulation 2016/679',
        frequency: 'continuous',
        responsible: 'Data Protection Officer',
        status: 'compliant',
        penalties: 'Up to €20M or 4% global revenue',
        criticalityLevel: 'critical'
      },
      {
        name: 'EU Working Time Directive',
        category: 'wage_hour',
        jurisdiction: 'international',
        description: 'Max 48 hours/week average, minimum rest periods',
        legalReference: 'Directive 2003/88/EC',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Varies by member state',
        criticalityLevel: 'high'
      },

      // United Kingdom
      {
        name: 'UK Employment Rights Act',
        category: 'labor_law',
        jurisdiction: 'international',
        description: 'Unfair dismissal protection, redundancy rights, etc.',
        legalReference: 'Employment Rights Act 1996',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Compensation awards, reinstatement',
        criticalityLevel: 'high'
      },

      // Canada
      {
        name: 'Canada Employment Standards',
        category: 'labor_law',
        jurisdiction: 'international',
        description: 'Minimum wage, overtime, vacation, statutory holidays',
        legalReference: 'Canada Labour Code Part III',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Back wages, penalties',
        criticalityLevel: 'high'
      },

      // Australia
      {
        name: 'AU Fair Work Act',
        category: 'labor_law',
        jurisdiction: 'international',
        description: 'National Employment Standards compliance',
        legalReference: 'Fair Work Act 2009',
        frequency: 'continuous',
        responsible: 'HR Manager',
        status: 'compliant',
        penalties: 'Civil penalties up to $66,600',
        criticalityLevel: 'high'
      }
    ];

    intlRequirements.forEach((req, index) => {
      const id = `intl_${index + 1}`;
      this.requirements.set(id, { id, ...req } as ComplianceRequirement);
    });
  }

  // ============ INDUSTRY-SPECIFIC COMPLIANCE ============

  private initializeIndustryCompliance(): void {
    const industryRequirements: Omit<ComplianceRequirement, 'id'>[] = [
      // Adult Entertainment Industry
      {
        name: '18 USC 2257 Record Keeping',
        category: 'record_keeping',
        jurisdiction: 'industry',
        description: 'Maintain records proving age of all performers (18+)',
        legalReference: '18 USC 2257, 28 CFR Part 75',
        frequency: 'continuous',
        responsible: 'Compliance Officer',
        status: 'compliant',
        penalties: 'Up to 5 years imprisonment, fines',
        criticalityLevel: 'critical'
      },
      {
        name: '2257 Custodian of Records',
        category: 'record_keeping',
        jurisdiction: 'industry',
        description: 'Designate and publicly list custodian of records',
        legalReference: '18 USC 2257(c)',
        frequency: 'continuous',
        responsible: 'Compliance Officer',
        status: 'compliant',
        penalties: 'Criminal prosecution, fines',
        criticalityLevel: 'critical'
      },
      {
        name: 'Performer Health and Safety',
        category: 'workplace_safety',
        jurisdiction: 'industry',
        description: 'STI testing protocols, health verification',
        legalReference: 'Cal/OSHA Bloodborne Pathogens Standard',
        frequency: 'continuous',
        responsible: 'Safety Officer',
        status: 'compliant',
        penalties: 'OSHA citations, civil liability',
        criticalityLevel: 'critical'
      },
      {
        name: 'Performer Consent Documentation',
        category: 'record_keeping',
        jurisdiction: 'industry',
        description: 'Written consent for all content, model releases',
        legalReference: 'Industry best practices, civil liability',
        frequency: 'continuous',
        responsible: 'Content Manager',
        status: 'compliant',
        penalties: 'Civil liability, injunctions',
        criticalityLevel: 'critical'
      }
    ];

    industryRequirements.forEach((req, index) => {
      const id = `ind_${index + 1}`;
      this.requirements.set(id, { id, ...req } as ComplianceRequirement);
    });
  }

  // ============ POLICY MANAGEMENT ============

  private initializePolicies(): void {
    const policies: Omit<PolicyDocument, 'id' | 'acknowledgedBy'>[] = [
      {
        title: 'Equal Employment Opportunity Policy',
        category: 'anti-discrimination',
        version: '1.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'CEO',
        content: 'We are an equal opportunity employer...',
        acknowledgmentRequired: true,
        relatedLaws: ['Title VII', 'ADA', 'ADEA']
      },
      {
        title: 'Anti-Harassment and Non-Discrimination Policy',
        category: 'workplace_conduct',
        version: '2.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'CEO',
        content: 'Zero tolerance for harassment...',
        acknowledgmentRequired: true,
        relatedLaws: ['Title VII', 'State harassment laws']
      },
      {
        title: 'Workplace Safety Policy',
        category: 'safety',
        version: '1.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'Safety Officer',
        content: 'Safety is our top priority...',
        acknowledgmentRequired: true,
        relatedLaws: ['OSHA General Duty Clause']
      },
      {
        title: 'Drug and Alcohol Policy',
        category: 'workplace_conduct',
        version: '1.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'HR Director',
        content: 'Drug-free workplace policy...',
        acknowledgmentRequired: true,
        relatedLaws: ['Drug-Free Workplace Act']
      },
      {
        title: 'Data Privacy and Confidentiality Policy',
        category: 'privacy',
        version: '1.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'Privacy Officer',
        content: 'Protect company and employee data...',
        acknowledgmentRequired: true,
        relatedLaws: ['GDPR', 'HIPAA']
      },
      {
        title: 'Code of Conduct',
        category: 'workplace_conduct',
        version: '1.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'CEO',
        content: 'Expected behaviors and ethics...',
        acknowledgmentRequired: true,
        relatedLaws: []
      },
      {
        title: 'Social Media Policy',
        category: 'technology',
        version: '1.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'Marketing Director',
        content: 'Guidelines for social media use...',
        acknowledgmentRequired: true,
        relatedLaws: ['NLRA Section 7']
      },
      {
        title: 'Whistleblower Protection Policy',
        category: 'compliance',
        version: '1.0',
        effectiveDate: new Date('2024-01-01'),
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2025-01-01'),
        approvedBy: 'Legal Counsel',
        content: 'Protection for reporting violations...',
        acknowledgmentRequired: true,
        relatedLaws: ['Sarbanes-Oxley Act', 'Dodd-Frank Act']
      }
    ];

    policies.forEach((policy, index) => {
      const id = `pol_${index + 1}`;
      this.policies.set(id, {
        id,
        ...policy,
        acknowledgedBy: new Set<string>()
      } as PolicyDocument);
    });
  }

  // ============ COMPLIANCE MONITORING ============

  private startComplianceMonitoring(): void {
    // Check compliance status daily
    setInterval(() => {
      this.performComplianceCheck();
    }, 24 * 60 * 60 * 1000); // Daily

    // Initial check
    setTimeout(() => {
      this.performComplianceCheck();
    }, 5000);
  }

  private performComplianceCheck(): void {
    const now = new Date();
    let warnings = 0;
    let criticalIssues = 0;

    this.requirements.forEach((req) => {
      // Check if review is due
      if (req.nextCheck && req.nextCheck < now) {
        req.status = 'warning';
        warnings++;

        if (req.criticalityLevel === 'critical') {
          criticalIssues++;
          this.emit('compliance:critical', {
            requirement: req,
            message: `Critical compliance review overdue: ${req.name}`
          });
        }
      }
    });

    console.log(`📋 Compliance check: ${warnings} warnings, ${criticalIssues} critical`);
  }

  // ============ PUBLIC API ============

  getAllRequirements(): ComplianceRequirement[] {
    return Array.from(this.requirements.values());
  }

  getRequirementsByJurisdiction(jurisdiction: ComplianceJurisdiction): ComplianceRequirement[] {
    return Array.from(this.requirements.values())
      .filter(req => req.jurisdiction === jurisdiction);
  }

  getRequirementsByCategory(category: ComplianceCategory): ComplianceRequirement[] {
    return Array.from(this.requirements.values())
      .filter(req => req.category === category);
  }

  getCriticalRequirements(): ComplianceRequirement[] {
    return Array.from(this.requirements.values())
      .filter(req => req.criticalityLevel === 'critical');
  }

  recordViolation(violation: Omit<ComplianceViolation, 'id'>): string {
    const id = `vio_${Date.now()}`;
    this.violations.set(id, { id, ...violation } as ComplianceViolation);

    const requirement = this.requirements.get(violation.requirementId);
    if (requirement) {
      requirement.status = 'violation';
      if (!requirement.violations) {
        requirement.violations = [];
      }
      requirement.violations.push({ id, ...violation } as ComplianceViolation);
    }

    this.emit('compliance:violation', { id, ...violation });
    console.log(`⚠️ Compliance violation recorded: ${violation.description}`);

    return id;
  }

  resolveViolation(violationId: string, resolutionNotes: string): boolean {
    const violation = this.violations.get(violationId);
    if (!violation) return false;

    violation.status = 'resolved';
    violation.resolutionDate = new Date();
    violation.resolutionNotes = resolutionNotes;

    this.emit('compliance:resolved', violation);
    console.log(`✅ Compliance violation resolved: ${violationId}`);

    return true;
  }

  getAllPolicies(): PolicyDocument[] {
    return Array.from(this.policies.values()).map(p => ({
      ...p,
      acknowledgedBy: new Set(p.acknowledgedBy) // Clone the Set
    }));
  }

  acknowledgePolicy(policyId: string, employeeId: string): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) return false;

    policy.acknowledgedBy.add(employeeId);
    this.emit('policy:acknowledged', { policyId, employeeId });
    return true;
  }

  getComplianceDashboard(): any {
    const totalRequirements = this.requirements.size;
    const compliant = Array.from(this.requirements.values())
      .filter(r => r.status === 'compliant').length;
    const warnings = Array.from(this.requirements.values())
      .filter(r => r.status === 'warning').length;
    const violations = Array.from(this.requirements.values())
      .filter(r => r.status === 'violation').length;

    return {
      overview: {
        totalRequirements,
        compliant,
        warnings,
        violations,
        complianceRate: ((compliant / totalRequirements) * 100).toFixed(2) + '%'
      },
      byJurisdiction: {
        federal: this.getRequirementsByJurisdiction('federal_us').length,
        state: this.getRequirementsByJurisdiction('state').length,
        international: this.getRequirementsByJurisdiction('international').length,
        industry: this.getRequirementsByJurisdiction('industry').length
      },
      byCategory: {
        labor_law: this.getRequirementsByCategory('labor_law').length,
        safety: this.getRequirementsByCategory('safety').length,
        discrimination: this.getRequirementsByCategory('discrimination').length,
        wage_hour: this.getRequirementsByCategory('wage_hour').length,
        benefits: this.getRequirementsByCategory('benefits').length,
        privacy: this.getRequirementsByCategory('privacy').length
      },
      critical: {
        total: this.getCriticalRequirements().length,
        compliant: this.getCriticalRequirements()
          .filter(r => r.status === 'compliant').length,
        violations: this.getCriticalRequirements()
          .filter(r => r.status === 'violation').length
      },
      recentViolations: Array.from(this.violations.values())
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10),
      policies: {
        total: this.policies.size,
        requireAcknowledgment: Array.from(this.policies.values())
          .filter(p => p.acknowledgmentRequired).length
      }
    };
  }
}

export const complianceManager = new ComplianceManager();

// Event listeners
complianceManager.on('compliance:critical', (data) => {
  console.error('🚨 CRITICAL COMPLIANCE ISSUE:', data);
});

complianceManager.on('compliance:violation', (data) => {
  console.warn('⚠️ Compliance violation:', data);
});

complianceManager.on('compliance:resolved', (data) => {
  console.log('✅ Compliance violation resolved:', data.id);
});
