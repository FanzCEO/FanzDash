/**
 * CRM Templates & Sample Data
 * Provides ready-to-use templates for leads, clients, deals, emails, proposals, and workflows
 */

// ============ EMAIL TEMPLATES ============

export const emailTemplates = [
  {
    id: 'welcome_lead',
    name: 'Welcome New Lead',
    subject: 'Welcome to {{company_name}} - Let\'s Get Started!',
    category: 'lead_nurture',
    body: `Hi {{lead_name}},

Thank you for your interest in {{company_name}}! We're excited to explore how we can help {{lead_company}} achieve its goals.

I wanted to personally reach out to:
• Schedule a quick 15-minute intro call
• Understand your current challenges and needs
• Show you how we've helped similar companies

What does your calendar look like this week? I have availability:
• {{time_slot_1}}
• {{time_slot_2}}
• {{time_slot_3}}

Looking forward to connecting!

Best regards,
{{sender_name}}
{{sender_title}}
{{company_name}}
{{contact_info}}`,
    variables: ['lead_name', 'lead_company', 'company_name', 'time_slot_1', 'time_slot_2', 'time_slot_3', 'sender_name', 'sender_title', 'contact_info']
  },
  {
    id: 'follow_up',
    name: 'Follow Up After Meeting',
    subject: 'Great meeting you, {{lead_name}}!',
    category: 'follow_up',
    body: `Hi {{lead_name}},

It was great speaking with you {{meeting_date}} about {{topic_discussed}}.

As discussed, here's a quick recap:
• {{key_point_1}}
• {{key_point_2}}
• {{key_point_3}}

Next Steps:
1. {{next_step_1}}
2. {{next_step_2}}
3. {{next_step_3}}

I'll follow up with the proposal by {{proposal_date}}. In the meantime, feel free to reach out with any questions!

Best,
{{sender_name}}`,
    variables: ['lead_name', 'meeting_date', 'topic_discussed', 'key_point_1', 'key_point_2', 'key_point_3', 'next_step_1', 'next_step_2', 'next_step_3', 'proposal_date', 'sender_name']
  },
  {
    id: 'proposal_sent',
    name: 'Proposal Sent',
    subject: '{{company_name}} Proposal - {{project_name}}',
    category: 'proposal',
    body: `Hi {{client_name}},

I'm pleased to share our proposal for {{project_name}}.

📎 Attached: {{company_name}} Proposal - {{project_name}}.pdf

This proposal includes:
• Detailed scope of work
• Timeline and milestones
• Investment breakdown
• Terms and conditions

**Key Highlights:**
• Estimated Value: \${{deal_value}}
• Timeline: {{timeline}}
• Start Date: {{start_date}}

I'm available to discuss any questions you may have. Would you like to schedule a call this week?

Looking forward to working together!

{{sender_name}}
{{sender_title}}`,
    variables: ['client_name', 'company_name', 'project_name', 'deal_value', 'timeline', 'start_date', 'sender_name', 'sender_title']
  },
  {
    id: 'contract_signed',
    name: 'Welcome New Client',
    subject: 'Welcome to {{company_name}}! Let\'s get started 🎉',
    category: 'onboarding',
    body: `Hi {{client_name}},

Welcome to the {{company_name}} family! We're thrilled to have {{client_company}} as our newest client.

**What happens next:**

Week 1: Onboarding & Setup
• Kickoff meeting scheduled for {{kickoff_date}}
• Account setup and access provisioning
• Introduction to your dedicated team

Week 2-4: Implementation
• {{milestone_1}}
• {{milestone_2}}
• {{milestone_3}}

**Your Team:**
• Account Manager: {{account_manager}}
• Project Lead: {{project_lead}}
• Support Contact: {{support_contact}}

We'll be in touch shortly to schedule our kickoff call. Excited to get started!

Best regards,
{{sender_name}}`,
    variables: ['client_name', 'client_company', 'company_name', 'kickoff_date', 'milestone_1', 'milestone_2', 'milestone_3', 'account_manager', 'project_lead', 'support_contact', 'sender_name']
  },
  {
    id: 'check_in',
    name: 'Client Check-In',
    subject: 'Quick check-in - How are things going?',
    category: 'client_success',
    body: `Hi {{client_name}},

I hope this email finds you well! I wanted to reach out for a quick check-in on {{project_name}}.

**Quick Questions:**
1. How is everything going so far?
2. Are there any challenges or concerns we should address?
3. Is there anything else we can help with?

We're committed to your success and want to make sure we're exceeding your expectations.

Would you have 15 minutes this week for a quick call?

Best,
{{sender_name}}`,
    variables: ['client_name', 'project_name', 'sender_name']
  },
  {
    id: 'payment_reminder',
    name: 'Friendly Payment Reminder',
    subject: 'Payment Due - Invoice #{{invoice_number}}',
    category: 'billing',
    body: `Hi {{client_name}},

This is a friendly reminder that Invoice #{{invoice_number}} is due on {{due_date}}.

**Invoice Details:**
• Amount Due: \${{amount_due}}
• Due Date: {{due_date}}
• Services: {{services}}

Payment can be made via:
• Bank transfer
• Credit card
• Check

If you've already sent payment, please disregard this message. If you have any questions about this invoice, please don't hesitate to reach out.

Thank you for your business!

{{sender_name}}
Accounts Receivable`,
    variables: ['client_name', 'invoice_number', 'due_date', 'amount_due', 'services', 'sender_name']
  }
];

// ============ PROPOSAL TEMPLATES ============

export const proposalTemplates = [
  {
    id: 'standard_proposal',
    name: 'Standard Service Proposal',
    sections: [
      {
        title: 'Executive Summary',
        content: `This proposal outlines our approach to helping {{client_company}} achieve {{main_objective}}.

**Proposed Solution:**
We will deliver {{solution_description}} over a {{timeline}} period.

**Expected Outcomes:**
• {{outcome_1}}
• {{outcome_2}}
• {{outcome_3}}`
      },
      {
        title: 'Scope of Work',
        content: `**Phase 1: Discovery & Planning** ({{phase1_duration}})
{{phase1_deliverables}}

**Phase 2: Implementation** ({{phase2_duration}})
{{phase2_deliverables}}

**Phase 3: Launch & Optimization** ({{phase3_duration}})
{{phase3_deliverables}}`
      },
      {
        title: 'Timeline',
        content: `**Project Start:** {{start_date}}
**Project Completion:** {{end_date}}
**Total Duration:** {{total_duration}}

**Key Milestones:**
• {{milestone_1}} - {{milestone_1_date}}
• {{milestone_2}} - {{milestone_2_date}}
• {{milestone_3}} - {{milestone_3_date}}`
      },
      {
        title: 'Investment',
        content: `**Total Investment:** \${{total_amount}}

**Payment Schedule:**
• Deposit (50%): \${{deposit_amount}} - Due upon signing
• Milestone Payment (25%): \${{milestone_payment}} - Due {{milestone_date}}
• Final Payment (25%): \${{final_payment}} - Due upon completion

**Included Services:**
• {{included_service_1}}
• {{included_service_2}}
• {{included_service_3}}`
      },
      {
        title: 'Terms & Conditions',
        content: `1. This proposal is valid for {{validity_days}} days from the date of issue.
2. All work will be completed according to the timeline specified above.
3. Additional services outside this scope will be billed separately.
4. Payment terms: {{payment_terms}}
5. Cancellation policy: {{cancellation_policy}}`
      }
    ]
  },
  {
    id: 'consulting_proposal',
    name: 'Consulting Services Proposal',
    sections: [
      {
        title: 'Situation Analysis',
        content: `**Current State:**
{{current_situation}}

**Challenges Identified:**
• {{challenge_1}}
• {{challenge_2}}
• {{challenge_3}}

**Opportunities:**
• {{opportunity_1}}
• {{opportunity_2}}`
      },
      {
        title: 'Recommended Approach',
        content: `We recommend a {{duration}}-month engagement focused on {{focus_areas}}.

**Deliverables:**
1. {{deliverable_1}}
2. {{deliverable_2}}
3. {{deliverable_3}}
4. {{deliverable_4}}`
      },
      {
        title: 'Investment & ROI',
        content: `**Monthly Retainer:** \${{monthly_amount}}
**Total Investment:** \${{total_amount}} ({{duration}} months)

**Expected ROI:**
• {{roi_metric_1}}: {{roi_value_1}}
• {{roi_metric_2}}: {{roi_value_2}}
• Break-even: {{breakeven_period}}`
      }
    ]
  }
];

// ============ WORKFLOW TEMPLATES ============

export const workflowTemplates = [
  {
    id: 'new_lead_workflow',
    name: 'New Lead Nurture Workflow',
    description: 'Automated workflow to nurture new leads',
    trigger: 'lead_created',
    steps: [
      {
        order: 1,
        action: 'send_email',
        template: 'welcome_lead',
        delay: '0 hours',
        description: 'Send welcome email immediately'
      },
      {
        order: 2,
        action: 'create_task',
        data: {
          title: 'Initial outreach call',
          priority: 'high',
          dueIn: '24 hours'
        },
        delay: '1 hour',
        description: 'Create task for sales rep to call'
      },
      {
        order: 3,
        action: 'send_email',
        template: 'follow_up',
        delay: '3 days',
        condition: 'lead_status == "contacted"',
        description: 'Send follow-up if lead was contacted'
      },
      {
        order: 4,
        action: 'update_lead_status',
        data: { status: 'cold' },
        delay: '7 days',
        condition: 'lead_status == "new"',
        description: 'Mark as cold if no contact made'
      }
    ]
  },
  {
    id: 'deal_won_workflow',
    name: 'Deal Won - Client Onboarding',
    description: 'Automate client onboarding when deal is won',
    trigger: 'deal_won',
    steps: [
      {
        order: 1,
        action: 'convert_to_client',
        description: 'Create client record from lead'
      },
      {
        order: 2,
        action: 'send_email',
        template: 'contract_signed',
        delay: '0 hours',
        description: 'Send welcome email to new client'
      },
      {
        order: 3,
        action: 'create_task',
        data: {
          title: 'Schedule kickoff meeting',
          priority: 'urgent',
          dueIn: '24 hours'
        },
        delay: '1 hour'
      },
      {
        order: 4,
        action: 'create_task',
        data: {
          title: 'Setup client account and access',
          priority: 'high',
          dueIn: '48 hours'
        },
        delay: '1 hour'
      },
      {
        order: 5,
        action: 'send_email',
        template: 'check_in',
        delay: '14 days',
        description: 'Two-week check-in'
      }
    ]
  }
];

// ============ SAMPLE/DEMO DATA ============

export const sampleLeads = [
  {
    id: 'lead_demo_1',
    name: 'Sarah Johnson',
    company: 'TechStartup Inc.',
    email: 'sarah.johnson@techstartup.com',
    phone: '+1 (555) 123-4567',
    source: 'website',
    status: 'qualified',
    assignedTo: 'sales_rep_1',
    estimatedValue: 50000,
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Interested in annual subscription. Budget confirmed. Decision maker identified.',
    tags: ['qualified', 'high-value', 'tech']
  },
  {
    id: 'lead_demo_2',
    name: 'Michael Chen',
    company: 'Global Solutions LLC',
    email: 'm.chen@globalsolutions.com',
    phone: '+1 (555) 234-5678',
    source: 'referral',
    status: 'proposal',
    assignedTo: 'sales_rep_1',
    estimatedValue: 75000,
    createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Proposal sent. Follow-up call scheduled for Friday.',
    tags: ['proposal-sent', 'referral', 'enterprise']
  },
  {
    id: 'lead_demo_3',
    name: 'Emma Rodriguez',
    company: 'Creative Agency Co.',
    email: 'emma.r@creativeagency.com',
    phone: '+1 (555) 345-6789',
    source: 'social_media',
    status: 'new',
    assignedTo: 'sales_rep_2',
    estimatedValue: 25000,
    createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Downloaded pricing guide. Needs initial contact.',
    tags: ['new', 'social', 'small-business']
  },
  {
    id: 'lead_demo_4',
    name: 'David Park',
    company: 'E-commerce Experts',
    email: 'david@ecommerceexperts.com',
    phone: '+1 (555) 456-7890',
    source: 'email_campaign',
    status: 'negotiation',
    assignedTo: 'sales_rep_1',
    estimatedValue: 100000,
    createdDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    lastContactDate: new Date().toISOString(),
    notes: 'Negotiating payment terms. Very interested, high close probability.',
    tags: ['hot-lead', 'negotiation', 'high-value']
  }
];

export const sampleClients = [
  {
    id: 'client_demo_1',
    name: 'John Smith',
    company: 'Acme Corporation',
    email: 'john.smith@acme.com',
    phone: '+1 (555) 111-2222',
    address: '123 Business St, San Francisco, CA 94105',
    industry: 'Technology',
    clientSince: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    totalRevenue: 250000,
    activeProjects: 2,
    status: 'active',
    contactPerson: 'John Smith - CEO',
    website: 'https://acme.com',
    notes: 'Tier 1 client. Annual contract. Very satisfied with services.'
  },
  {
    id: 'client_demo_2',
    name: 'Lisa Wang',
    company: 'Digital Dynamics',
    email: 'lisa@digitaldynamics.com',
    phone: '+1 (555) 222-3333',
    address: '456 Tech Ave, Austin, TX 78701',
    industry: 'Marketing',
    clientSince: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    totalRevenue: 120000,
    activeProjects: 1,
    status: 'active',
    contactPerson: 'Lisa Wang - CMO',
    website: 'https://digitaldynamics.com',
    notes: 'Growing account. Potential for upsell next quarter.'
  }
];

export const sampleDeals = [
  {
    id: 'deal_demo_1',
    title: 'Annual Enterprise License',
    clientId: 'client_demo_1',
    clientName: 'Acme Corporation',
    value: 150000,
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    owner: 'sales_rep_1',
    products: ['Enterprise Plan', 'Premium Support', 'Training Package'],
    notes: 'Renewal + expansion. Strong relationship.',
    createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'deal_demo_2',
    title: 'Q4 Consulting Engagement',
    clientId: 'client_demo_2',
    clientName: 'Digital Dynamics',
    value: 50000,
    stage: 'proposal',
    probability: 60,
    expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    owner: 'sales_rep_2',
    products: ['Consulting Services', 'Strategy Workshop'],
    notes: 'Proposal sent. Waiting for budget approval.',
    createdDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const sampleTasks = [
  {
    id: 'task_demo_1',
    title: 'Follow up with Sarah Johnson',
    description: 'Discuss pricing and next steps for TechStartup Inc. proposal',
    priority: 'high',
    status: 'pending',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'sales_rep_1',
    relatedTo: { type: 'lead', id: 'lead_demo_1' },
    createdAt: new Date().toISOString()
  },
  {
    id: 'task_demo_2',
    title: 'Prepare renewal proposal for Acme Corp',
    description: 'Annual renewal coming up. Include expansion options.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'sales_rep_1',
    relatedTo: { type: 'client', id: 'client_demo_1' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task_demo_3',
    title: 'Initial contact - Emma Rodriguez',
    description: 'Make introductory call to new lead from social media',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'sales_rep_2',
    relatedTo: { type: 'lead', id: 'lead_demo_3' },
    createdAt: new Date().toISOString()
  }
];
