/**
 * FANZ Team Invitation Templates
 * Quick new hire invitation setup with pre-configured settings
 */

import { AccessProfile } from './AccessProfiles';

export interface TeamInvitation {
  id: string;
  recipientEmail: string;
  recipientName: string;
  jobTitle: string;
  department: string;
  accessProfileId: string;
  startDate: string;
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  personalizedMessage?: string;
  autoProvision: {
    emailAccount: boolean;
    slackAccount: boolean;
    dashboardAccess: boolean;
    tools: string[];
  };
  onboardingTemplateId?: string;
  welcomePackage: {
    sendWelcomeEmail: boolean;
    sendSwag: boolean;
    scheduleOrientation: boolean;
    assignBuddy: boolean;
    buddyEmail?: string;
  };
}

export interface InvitationTemplate {
  name: string;
  emailSubject: string;
  emailBody: string;
  defaultExpiryDays: number;
  requiredApprovals: string[];
  autoReminders: boolean;
  reminderDays: number[];
}

export const INVITATION_TEMPLATES: Record<string, InvitationTemplate> = {
  EXECUTIVE: {
    name: 'Executive Invitation',
    emailSubject: 'Welcome to FANZ - Executive Team Invitation',
    emailBody: `
Dear {{recipientName}},

We're thrilled to welcome you to the FANZ executive team as our new {{jobTitle}}!

Your expertise and leadership will be instrumental in driving our mission to empower creators across 94 premium content platforms.

**Getting Started:**
- Start Date: {{startDate}}
- Department: {{department}}
- Reporting To: {{reportsTo}}
- Office Location: Remote/Hybrid

**Pre-Start Checklist:**
Please complete the following before your start date:
- [ ] Review and sign your employment agreement (sent separately)
- [ ] Complete background check authorization
- [ ] Submit I-9 documentation
- [ ] Enroll in benefits (link will be sent 7 days before start)
- [ ] Set up direct deposit

**What to Expect on Day 1:**
- Executive team welcome meeting
- IT setup and security briefing
- Overview of FANZ ecosystem and strategy
- Introduction to your direct reports
- Strategic planning session

Our People Operations team will reach out shortly with additional details and to answer any questions.

We're excited to have you join us!

Best regards,
The FANZ Leadership Team

---
This invitation expires in {{expiryDays}} days. Please accept by clicking here: {{invitationLink}}
    `,
    defaultExpiryDays: 14,
    requiredApprovals: ['CEO', 'CPO'],
    autoReminders: true,
    reminderDays: [7, 3, 1]
  },

  MANAGEMENT: {
    name: 'Management Invitation',
    emailSubject: 'Welcome to FANZ - {{jobTitle}} Position',
    emailBody: `
Hi {{recipientName}},

Welcome to FANZ! We're excited to have you join our {{department}} team as {{jobTitle}}.

**Position Details:**
- Start Date: {{startDate}}
- Department: {{department}}
- Reports To: {{reportsTo}}
- Team Size: {{teamSize}} direct reports
- Location: {{location}}

**Before You Start:**
Please complete these items before {{startDate}}:
- [ ] Accept this invitation and create your account
- [ ] Complete new hire paperwork (sent to your email)
- [ ] Review company handbook and policies
- [ ] Schedule your orientation call with HR
- [ ] Confirm your equipment preferences (laptop, monitor, etc.)

**Your First Week:**
Week 1 will focus on onboarding and getting to know your team:
- Meet your direct reports and key stakeholders
- Learn our tools, processes, and systems
- Attend {{department}} team meetings
- Complete required training modules
- Shadow operations and review documentation

Your hiring manager, {{managerName}}, will reach out shortly to schedule a pre-start call.

Looking forward to working with you!

Best,
FANZ People Operations

---
Accept invitation: {{invitationLink}}
Expires: {{expiryDate}}
    `,
    defaultExpiryDays: 10,
    requiredApprovals: ['Department Head', 'HR'],
    autoReminders: true,
    reminderDays: [5, 2]
  },

  INDIVIDUAL_CONTRIBUTOR: {
    name: 'Individual Contributor Invitation',
    emailSubject: 'Join the FANZ Team - {{jobTitle}}',
    emailBody: `
Hello {{recipientName}},

Congratulations and welcome to FANZ! We're excited for you to join us as a {{jobTitle}} in our {{department}} team.

**Your Role:**
Position: {{jobTitle}}
Team: {{department}}
Start Date: {{startDate}}
Manager: {{managerName}}
Location: {{location}}

**Next Steps:**
To get started, please:

1. **Accept this invitation** (link below) to create your FANZ account
2. **Complete pre-boarding** - You'll receive separate emails for:
   - Employment paperwork (W-4, I-9, direct deposit)
   - Benefits enrollment (health, dental, 401k)
   - Background check (if not already completed)
3. **Order your equipment** - You'll receive a link to select your laptop and accessories
4. **Review our handbook** - Available after you create your account

**What's Next?**
- **1 week before start**: IT will send your equipment and setup instructions
- **3 days before start**: You'll receive your onboarding schedule
- **Day 1**: Virtual orientation with HR and your manager
- **Week 1**: Training, team intros, and getting set up

**Buddy Program:**
You'll be paired with {{buddyName}}, a team member who will help you navigate your first few weeks at FANZ.

We're here to help! If you have any questions, reply to this email or contact people-ops@fanz.com.

Welcome aboard!

FANZ People Operations Team

---
Click to accept: {{invitationLink}}
This invitation expires on {{expiryDate}}
    `,
    defaultExpiryDays: 7,
    requiredApprovals: ['Hiring Manager'],
    autoReminders: true,
    reminderDays: [3, 1]
  },

  CONTRACTOR: {
    name: 'Contractor/Consultant Invitation',
    emailSubject: 'FANZ Contractor Access - {{projectName}}',
    emailBody: `
Hello {{recipientName}},

This email grants you temporary access to FANZ systems for the following project:

**Project Details:**
Project: {{projectName}}
Role: {{jobTitle}}
Duration: {{startDate}} - {{endDate}}
Project Lead: {{projectLead}}

**Access Granted:**
- FANZ Dashboard (Limited Access)
- Project Slack Channel
- Documentation Repository
- {{additionalTools}}

**Important Information:**
- Your access is limited to project-specific resources
- All work is subject to NDA and contractor agreement
- Access will automatically expire on {{endDate}}
- For access issues, contact it-support@fanz.com

**Security Requirements:**
- Enable 2-factor authentication (required)
- Use VPN for all connections
- Do not share credentials
- Report any security concerns immediately

**Getting Started:**
1. Accept this invitation: {{invitationLink}}
2. Set up your account and 2FA
3. Review project documentation
4. Join project kickoff call: {{kickoffLink}}

Your project lead {{projectLead}} will reach out shortly with additional details.

Best,
FANZ IT Operations

---
Invitation expires: {{expiryDate}}
    `,
    defaultExpiryDays: 3,
    requiredApprovals: ['Project Lead', 'IT Security'],
    autoReminders: true,
    reminderDays: [1]
  },

  INTERN: {
    name: 'Intern Invitation',
    emailSubject: 'Welcome to Your FANZ Internship!',
    emailBody: `
Hi {{recipientName}},

Congratulations on joining FANZ as a {{jobTitle}} intern! We're excited to have you on the team.

**Internship Details:**
Position: {{jobTitle}}
Department: {{department}}
Duration: {{startDate}} - {{endDate}} ({{durationWeeks}} weeks)
Manager: {{managerName}}
Location: {{location}}

**What to Expect:**
Our internship program provides hands-on experience in {{department}} with:
- Real projects that impact our creator community
- Mentorship from experienced team members
- Professional development workshops
- Networking opportunities across the company
- Potential for full-time offer upon graduation

**Before Your Start Date:**
- [ ] Accept this invitation
- [ ] Complete internship paperwork
- [ ] Confirm your summer housing (if applicable)
- [ ] Review intern handbook
- [ ] Join FANZ interns Slack channel

**Your First Day:**
- 9:00 AM - Intern orientation (all interns)
- 11:00 AM - Department welcome
- 12:00 PM - Lunch with your manager and team
- 2:00 PM - IT setup and tool access
- 3:30 PM - Campus tour (if on-site)

We've also assigned you a mentor, {{mentorName}}, who will help guide you throughout your internship.

Have questions? Our Intern Program Coordinator, {{coordinatorName}}, is here to help: interns@fanz.com

Can't wait to meet you!

The FANZ Intern Program Team

---
Accept your internship: {{invitationLink}}
Expires: {{expiryDate}}
    `,
    defaultExpiryDays: 10,
    requiredApprovals: ['Department Manager', 'Intern Program Coordinator'],
    autoReminders: true,
    reminderDays: [5, 2]
  }
};

/**
 * Create a new team invitation
 */
export function createTeamInvitation(params: {
  recipientEmail: string;
  recipientName: string;
  jobTitle: string;
  department: string;
  accessProfileId: string;
  startDate: string;
  invitedBy: string;
  templateType: keyof typeof INVITATION_TEMPLATES;
  personalizedMessage?: string;
  onboardingTemplateId?: string;
  buddyEmail?: string;
}): TeamInvitation {
  const template = INVITATION_TEMPLATES[params.templateType];
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + template.defaultExpiryDays);

  return {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    jobTitle: params.jobTitle,
    department: params.department,
    accessProfileId: params.accessProfileId,
    startDate: params.startDate,
    invitedBy: params.invitedBy,
    invitedAt: new Date(),
    expiresAt: expiryDate,
    status: 'pending',
    personalizedMessage: params.personalizedMessage,
    autoProvision: {
      emailAccount: true,
      slackAccount: true,
      dashboardAccess: true,
      tools: []
    },
    onboardingTemplateId: params.onboardingTemplateId,
    welcomePackage: {
      sendWelcomeEmail: true,
      sendSwag: params.templateType !== 'CONTRACTOR',
      scheduleOrientation: true,
      assignBuddy: !!params.buddyEmail,
      buddyEmail: params.buddyEmail
    }
  };
}

/**
 * Render invitation email
 */
export function renderInvitationEmail(
  invitation: TeamInvitation,
  templateType: keyof typeof INVITATION_TEMPLATES,
  variables: Record<string, any>
): { subject: string; body: string } {
  const template = INVITATION_TEMPLATES[templateType];

  let subject = template.emailSubject;
  let body = template.emailBody;

  // Replace all variables
  const allVars = {
    recipientName: invitation.recipientName,
    jobTitle: invitation.jobTitle,
    department: invitation.department,
    startDate: invitation.startDate,
    expiryDate: invitation.expiresAt.toLocaleDateString(),
    expiryDays: template.defaultExpiryDays,
    invitationLink: `https://dashboard.fanz.com/accept-invitation/${invitation.id}`,
    ...variables
  };

  Object.entries(allVars).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, String(value));
    body = body.replace(regex, String(value));
  });

  return { subject, body };
}

/**
 * Bulk invitation for team hiring
 */
export interface BulkInvitation {
  templateType: keyof typeof INVITATION_TEMPLATES;
  invitations: Array<{
    recipientEmail: string;
    recipientName: string;
    jobTitle: string;
    startDate: string;
    customVariables?: Record<string, any>;
  }>;
  department: string;
  accessProfileId: string;
  invitedBy: string;
}

export function createBulkInvitations(params: BulkInvitation): TeamInvitation[] {
  return params.invitations.map(inv =>
    createTeamInvitation({
      recipientEmail: inv.recipientEmail,
      recipientName: inv.recipientName,
      jobTitle: inv.jobTitle,
      department: params.department,
      accessProfileId: params.accessProfileId,
      startDate: inv.startDate,
      invitedBy: params.invitedBy,
      templateType: params.templateType
    })
  );
}
