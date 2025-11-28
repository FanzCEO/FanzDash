-- =============================================================================
-- FANZ Unified Ecosystem - Enterprise Systems Database Schema
-- Comprehensive schema for all 10 enterprise management systems
-- Database: PostgreSQL 14+
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================================================
-- 1. SCHEDULE MANAGEMENT SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS work_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type VARCHAR(50) NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'evening', 'night', 'full_day')),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed')),
    location VARCHAR(50) NOT NULL CHECK (location IN ('office', 'remote', 'hybrid')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'unpaid', 'bereavement', 'other')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(255),
    reviewed_date TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. HR MANAGEMENT SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    employment_type VARCHAR(50) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'terminated', 'suspended')),
    manager_id UUID,
    salary DECIMAL(15, 2),
    benefits JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    reviewer_id UUID NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    overall_rating DECIMAL(3, 2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
    goals_rating DECIMAL(3, 2),
    communication_rating DECIMAL(3, 2),
    teamwork_rating DECIMAL(3, 2),
    technical_rating DECIMAL(3, 2),
    comments TEXT,
    goals JSONB,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'acknowledged')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    gross_pay DECIMAL(15, 2) NOT NULL,
    tax_deductions DECIMAL(15, 2) DEFAULT 0,
    benefit_deductions DECIMAL(15, 2) DEFAULT 0,
    retirement_deductions DECIMAL(15, 2) DEFAULT 0,
    other_deductions DECIMAL(15, 2) DEFAULT 0,
    net_pay DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'paid', 'failed')),
    payment_date DATE,
    payment_method VARCHAR(50) CHECK (payment_method IN ('direct_deposit', 'check', 'wire_transfer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id UUID,
    budget DECIMAL(15, 2),
    employee_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. CRM SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
    assigned_to UUID,
    estimated_value DECIMAL(15, 2),
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    industry VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    account_manager_id UUID,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    client_id UUID REFERENCES crm_clients(id),
    lead_id UUID REFERENCES crm_leads(id),
    value DECIMAL(15, 2) NOT NULL,
    stage VARCHAR(50) DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    probability DECIMAL(5, 2),
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_to UUID,
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crm_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) CHECK (type IN ('call', 'email', 'meeting', 'task', 'note')),
    subject VARCHAR(255),
    description TEXT,
    related_to_type VARCHAR(50),
    related_to_id UUID,
    user_id UUID,
    user_name VARCHAR(255),
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 4. ERP SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(15, 2),
    reorder_point INTEGER,
    reorder_quantity INTEGER,
    supplier_id UUID,
    location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    client_id UUID,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2) DEFAULT 0,
    manager_id UUID,
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date DATE,
    completed_date DATE,
    estimated_hours DECIMAL(6, 2),
    actual_hours DECIMAL(6, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date DATE NOT NULL,
    type VARCHAR(50) CHECK (type IN ('income', 'expense', 'transfer')),
    category VARCHAR(100),
    amount DECIMAL(15, 2) NOT NULL,
    account VARCHAR(100),
    description TEXT,
    reference VARCHAR(100),
    attachments JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 5. EMAIL MARKETING SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    preview_text VARCHAR(255),
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    template_id UUID,
    list_ids UUID[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    scheduled_date TIMESTAMP,
    sent_date TIMESTAMP,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    open_rate DECIMAL(5, 2) DEFAULT 0,
    click_rate DECIMAL(5, 2) DEFAULT 0,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    html_content TEXT NOT NULL,
    text_content TEXT,
    thumbnail_url VARCHAR(500),
    variables JSONB,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
    list_ids UUID[],
    tags VARCHAR(100)[],
    custom_fields JSONB,
    engagement_score DECIMAL(5, 2) DEFAULT 0,
    subscribed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_date TIMESTAMP,
    last_engagement_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 6. SOCIAL MEDIA AUTOMATION SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'bluesky')),
    brand VARCHAR(100) NOT NULL,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    followers INTEGER DEFAULT 0,
    is_connected BOOLEAN DEFAULT true,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    last_sync TIMESTAMP,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, brand, username)
);

CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    platforms VARCHAR(50)[],
    brands VARCHAR(100)[],
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    scheduled_date TIMESTAMP,
    published_date TIMESTAMP,
    media_urls VARCHAR(500)[],
    media_type VARCHAR(50) CHECK (media_type IN ('text', 'image', 'video', 'carousel')),
    hashtags VARCHAR(100)[],
    mentions VARCHAR(100)[],
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    engagement DECIMAL(5, 2) DEFAULT 0,
    created_by UUID,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES social_accounts(id),
    date DATE NOT NULL,
    followers_gain INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, date)
);

-- =============================================================================
-- 7. DOCUMENT MANAGEMENT SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('file', 'folder')),
    file_type VARCHAR(50),
    size BIGINT DEFAULT 0,
    path TEXT NOT NULL,
    folder_id UUID,
    is_encrypted BOOLEAN DEFAULT false,
    encryption_method VARCHAR(50),
    tags VARCHAR(100)[],
    owner_id UUID NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_date TIMESTAMP,
    version INTEGER DEFAULT 1,
    is_shared BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_date TIMESTAMP,
    checksum VARCHAR(255),
    mime_type VARCHAR(100),
    thumbnail_url VARCHAR(500),
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES document_files(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    size BIGINT NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changes TEXT,
    checksum VARCHAR(255),
    is_current BOOLEAN DEFAULT false,
    UNIQUE(file_id, version)
);

CREATE TABLE IF NOT EXISTS document_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES document_files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('owner', 'editor', 'viewer', 'commenter')),
    can_download BOOLEAN DEFAULT false,
    can_share BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    granted_by VARCHAR(255),
    granted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_date TIMESTAMP,
    UNIQUE(file_id, user_id)
);

CREATE TABLE IF NOT EXISTS document_share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES document_files(id) ON DELETE CASCADE,
    url VARCHAR(500) UNIQUE NOT NULL,
    access_type VARCHAR(50) CHECK (access_type IN ('view', 'edit', 'download')),
    requires_password BOOLEAN DEFAULT false,
    password_hash TEXT,
    expires_date TIMESTAMP,
    max_downloads INTEGER,
    download_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- =============================================================================
-- 8. eSIGN & DOCUMENT WORKFLOW SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS esign_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_name VARCHAR(255) NOT NULL,
    document_id UUID,
    subject VARCHAR(500) NOT NULL,
    message TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'in_progress', 'partially_signed', 'completed', 'expired', 'cancelled', 'declined')),
    created_by VARCHAR(255) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_date TIMESTAMP,
    completed_date TIMESTAMP,
    expires_date TIMESTAMP,
    workflow VARCHAR(50) DEFAULT 'sequential' CHECK (workflow IN ('sequential', 'parallel')),
    requires_all_signers BOOLEAN DEFAULT true,
    email_reminders BOOLEAN DEFAULT true,
    reminder_frequency INTEGER,
    certificate_url VARCHAR(500),
    audit_trail_url VARCHAR(500),
    is_legally_binding BOOLEAN DEFAULT true,
    signature_count INTEGER DEFAULT 0,
    total_signers INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP
);

CREATE TABLE IF NOT EXISTS esign_signers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES esign_requests(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('signer', 'approver', 'cc', 'viewer')),
    order_num INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'declined', 'expired')),
    sent_date TIMESTAMP,
    viewed_date TIMESTAMP,
    signed_date TIMESTAMP,
    declined_date TIMESTAMP,
    decline_reason TEXT,
    ip_address VARCHAR(100),
    device VARCHAR(255),
    signature_image_url VARCHAR(500),
    UNIQUE(request_id, email, order_num)
);

CREATE TABLE IF NOT EXISTS esign_document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) CHECK (category IN ('contract', 'nda', 'agreement', 'invoice', 'form', 'other')),
    document_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    fields JSONB,
    default_signers INTEGER DEFAULT 1,
    workflow VARCHAR(50) DEFAULT 'sequential',
    usage_count INTEGER DEFAULT 0,
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_name VARCHAR(255),
    document_id UUID,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'cancelled')),
    created_by VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_stage INTEGER DEFAULT 1,
    total_stages INTEGER NOT NULL,
    requires_all_approvals BOOLEAN DEFAULT true,
    completed_date TIMESTAMP
);

-- =============================================================================
-- 9. AUDIT TRAIL SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    resource_name VARCHAR(255),
    description TEXT,
    changes JSONB,
    metadata JSONB,
    severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) CHECK (status IN ('success', 'failed', 'partial')),
    ip_address VARCHAR(100),
    device_type VARCHAR(50),
    device_os VARCHAR(100),
    device_browser VARCHAR(100),
    device_fingerprint VARCHAR(255),
    location_country VARCHAR(100),
    location_region VARCHAR(100),
    location_city VARCHAR(100),
    session_id VARCHAR(255),
    duration INTEGER
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) CHECK (report_type IN ('gdpr', 'hipaa', 'sox', 'pci_dss', 'custom')),
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generated_by VARCHAR(255),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_records INTEGER DEFAULT 0,
    data_accesses INTEGER DEFAULT 0,
    data_modifications INTEGER DEFAULT 0,
    data_deletions INTEGER DEFAULT 0,
    security_events INTEGER DEFAULT 0,
    findings JSONB,
    status VARCHAR(50) CHECK (status IN ('pass', 'fail', 'warning')),
    download_url VARCHAR(500)
);

-- =============================================================================
-- 10. DATA LOSS PREVENTION (DLP) SYSTEM
-- =============================================================================

CREATE TABLE IF NOT EXISTS dlp_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
    alert_type VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_name VARCHAR(255),
    resource_id UUID,
    action VARCHAR(100),
    description TEXT,
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    policy_violated VARCHAR(255),
    detection_method VARCHAR(50),
    ip_address VARCHAR(100),
    device VARCHAR(255),
    location VARCHAR(255),
    data_classification VARCHAR(50),
    automatic_actions VARCHAR(100)[],
    assigned_to VARCHAR(255),
    notes TEXT[]
);

CREATE INDEX idx_dlp_alerts_timestamp ON dlp_alerts(timestamp DESC);
CREATE INDEX idx_dlp_alerts_severity ON dlp_alerts(severity);
CREATE INDEX idx_dlp_alerts_status ON dlp_alerts(status);
CREATE INDEX idx_dlp_alerts_user_id ON dlp_alerts(user_id);

CREATE TABLE IF NOT EXISTS dlp_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    severity VARCHAR(50) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    scope VARCHAR(100),
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    data_classifications VARCHAR(50)[],
    excluded_users UUID[],
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    triggered_count INTEGER DEFAULT 0,
    last_triggered TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quarantined_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    quarantine_reason TEXT NOT NULL,
    quarantine_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alert_id UUID REFERENCES dlp_alerts(id),
    review_status VARCHAR(50) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'denied')),
    reviewed_by VARCHAR(255),
    reviewed_date TIMESTAMP,
    review_notes TEXT,
    expires_date TIMESTAMP,
    can_restore BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    critical_alerts INTEGER DEFAULT 0,
    high_alerts INTEGER DEFAULT 0,
    medium_alerts INTEGER DEFAULT 0,
    low_alerts INTEGER DEFAULT 0,
    suspicious_activities INTEGER DEFAULT 0,
    data_accessed INTEGER DEFAULT 0,
    files_downloaded INTEGER DEFAULT 0,
    policy_violations INTEGER DEFAULT 0,
    last_activity TIMESTAMP,
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'monitoring', 'restricted')),
    watchlisted BOOLEAN DEFAULT false,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    level VARCHAR(50) CHECK (level IN ('public', 'internal', 'confidential', 'restricted')),
    description TEXT,
    color VARCHAR(50),
    retention_period INTEGER,
    requires_encryption BOOLEAN DEFAULT false,
    allow_external_sharing BOOLEAN DEFAULT true,
    allow_download BOOLEAN DEFAULT true,
    allow_print BOOLEAN DEFAULT true,
    allow_copy BOOLEAN DEFAULT true,
    watermark_required BOOLEAN DEFAULT false,
    rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- COMMON TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(100),
    description TEXT,
    updated_by VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_entity_type VARCHAR(100),
    related_entity_id UUID,
    is_public BOOLEAN DEFAULT false,
    access_url VARCHAR(500)
);

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Schedule Management
CREATE INDEX idx_work_shifts_employee ON work_shifts(employee_id);
CREATE INDEX idx_work_shifts_date ON work_shifts(shift_date);
CREATE INDEX idx_time_off_dates ON time_off_requests(start_date, end_date);

-- HR Management
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_payroll_employee ON payroll_records(employee_id);
CREATE INDEX idx_performance_employee ON performance_reviews(employee_id);

-- CRM
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_clients_status ON crm_clients(status);
CREATE INDEX idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX idx_crm_activities_date ON crm_activities(activity_date DESC);

-- ERP
CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_transactions_date ON financial_transactions(transaction_date DESC);

-- Email Marketing
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_subscribers_status ON email_subscribers(status);

-- Social Media
CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_accounts_brand ON social_accounts(brand);

-- Documents
CREATE INDEX idx_document_files_owner ON document_files(owner_id);
CREATE INDEX idx_document_files_folder ON document_files(folder_id);
CREATE INDEX idx_document_files_deleted ON document_files(is_deleted);

-- eSign
CREATE INDEX idx_esign_requests_status ON esign_requests(status);
CREATE INDEX idx_esign_signers_request ON esign_signers(request_id);

-- Full-text search indexes
CREATE INDEX idx_audit_logs_description_fts ON audit_logs USING gin(to_tsvector('english', description));
CREATE INDEX idx_document_files_name_fts ON document_files USING gin(to_tsvector('english', name));

-- =============================================================================
-- CREATE FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_work_shifts_timestamp BEFORE UPDATE ON work_shifts
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_employees_timestamp BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_inventory_timestamp BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_document_files_timestamp BEFORE UPDATE ON document_files
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
