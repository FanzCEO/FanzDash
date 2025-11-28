-- Migration: 2257 Verification System
-- Created: 2025-11-07
-- Description: Complete verification system for content creators and co-stars

-- Create enums
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');
CREATE TYPE verification_level AS ENUM ('basic', 'enhanced', 'full_compliance');
CREATE TYPE id_type AS ENUM ('drivers_license', 'passport', 'national_id', 'other');

-- Content Creator Verifications Table
CREATE TABLE IF NOT EXISTS creator_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- Step 1: Creator Identification
    full_legal_name TEXT NOT NULL,
    stage_name TEXT,
    date_of_birth TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),
    pronouns TEXT,
    country_of_citizenship TEXT NOT NULL,

    -- Address
    residential_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state_province TEXT NOT NULL,
    zip_postal_code TEXT NOT NULL,

    -- Contact
    mobile_phone TEXT NOT NULL,
    email_address TEXT NOT NULL,

    -- Step 2: Identification (JSONB for array of types)
    identification_type JSONB NOT NULL,
    drivers_license_number TEXT,
    drivers_license_state TEXT,
    passport_number TEXT,
    passport_country TEXT,
    national_id_number TEXT,
    national_id_authority TEXT,
    other_id_type TEXT,
    other_id_number TEXT,

    -- Step 3: Digital Verification
    photo_id_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
    photo_id_url TEXT,
    selfie_verified BOOLEAN NOT NULL DEFAULT FALSE,
    selfie_url TEXT,
    age_metadata_validated BOOLEAN NOT NULL DEFAULT FALSE,
    blockchain_id_opt_in BOOLEAN DEFAULT FALSE,
    blockchain_id_hash TEXT,
    signature_captured BOOLEAN NOT NULL DEFAULT FALSE,
    signature_url TEXT,
    two_factor_setup BOOLEAN NOT NULL DEFAULT FALSE,

    -- Step 4: Certifications
    certify_independent_creator BOOLEAN NOT NULL DEFAULT FALSE,
    certify_retain_ownership BOOLEAN NOT NULL DEFAULT FALSE,
    certify_2257_compliance BOOLEAN NOT NULL DEFAULT FALSE,
    certify_all_performers_18 BOOLEAN NOT NULL DEFAULT FALSE,
    certify_distribution_rights BOOLEAN NOT NULL DEFAULT FALSE,

    -- Step 5: Content Policy
    acknowledge_prohibited_content BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledge_prohibited_conduct BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledge_zero_tolerance BOOLEAN NOT NULL DEFAULT FALSE,

    -- Step 6: Legal Agreements
    acknowledge_content_ownership BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledge_data_privacy BOOLEAN NOT NULL DEFAULT FALSE,
    accept_arbitration BOOLEAN NOT NULL DEFAULT FALSE,
    accept_indemnification BOOLEAN NOT NULL DEFAULT FALSE,

    -- Step 7: Sworn Declarations
    sworn_declaration_all_ids_valid BOOLEAN NOT NULL DEFAULT FALSE,
    sworn_declaration_all_performers_verified BOOLEAN NOT NULL DEFAULT FALSE,
    sworn_declaration_maintain_2257 BOOLEAN NOT NULL DEFAULT FALSE,
    sworn_declaration_freely_entering BOOLEAN NOT NULL DEFAULT FALSE,

    -- Signature
    signature_date TEXT NOT NULL,
    electronic_signature_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,

    -- Status & Review
    status verification_status NOT NULL DEFAULT 'pending',
    verification_level verification_level DEFAULT 'basic',

    -- Admin Actions
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMP,
    approved_by TEXT,
    rejected_at TIMESTAMP,
    rejected_by TEXT,
    rejection_reason TEXT,
    detailed_feedback TEXT,
    review_notes TEXT,

    -- Audit
    platform TEXT NOT NULL DEFAULT 'fanzdash',
    ip_address TEXT,
    user_agent TEXT,

    -- Additional data
    metadata JSONB,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Co-Star Verifications Table
CREATE TABLE IF NOT EXISTS costar_verifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,

    -- Co-Star Information
    legal_name TEXT NOT NULL,
    stage_name TEXT,
    maiden_name TEXT,
    previous_legal_name TEXT,
    other_names TEXT,
    date_of_birth TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18),

    -- Identification
    identification_type TEXT NOT NULL,
    identification_number TEXT NOT NULL,
    identification_state TEXT,
    identification_other TEXT,

    -- Address
    address TEXT NOT NULL,
    apt TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    cell_phone TEXT NOT NULL,
    home_phone TEXT,

    -- Primary Creator Information
    primary_creator_legal_name TEXT NOT NULL,
    primary_creator_stage_name TEXT,
    content_creation_date TEXT NOT NULL,

    -- Certifications
    certify_age_18 BOOLEAN NOT NULL DEFAULT FALSE,
    certify_all_names BOOLEAN NOT NULL DEFAULT FALSE,
    certify_valid_id BOOLEAN NOT NULL DEFAULT FALSE,
    certify_no_illegal_acts BOOLEAN NOT NULL DEFAULT FALSE,
    certify_freely_entering BOOLEAN NOT NULL DEFAULT FALSE,

    -- Signatures & Dates
    costar_signature_date TEXT NOT NULL,
    costar_initials TEXT NOT NULL,
    primary_creator_signature_date TEXT NOT NULL,

    -- Document URLs
    id_front_image_url TEXT,
    id_back_image_url TEXT,
    holding_id_image_url TEXT,
    additional_documents_urls JSONB,

    -- Status & Review
    status verification_status NOT NULL DEFAULT 'pending',

    -- Admin Actions
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    submitted_by TEXT,
    approved_at TIMESTAMP,
    approved_by TEXT,
    rejected_at TIMESTAMP,
    rejected_by TEXT,
    rejection_reason TEXT,
    review_notes TEXT,

    -- Audit
    platform TEXT NOT NULL DEFAULT 'fanzdash',
    ip_address TEXT,
    user_agent TEXT,

    -- Additional data
    metadata JSONB,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Verification Audit Log Table
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id TEXT PRIMARY KEY,
    verification_type TEXT NOT NULL CHECK (verification_type IN ('creator', 'costar')),
    verification_id TEXT NOT NULL,

    -- Action Details
    action TEXT NOT NULL,
    performed_by TEXT NOT NULL,
    performed_by_role TEXT,

    -- Details
    details JSONB,
    reason TEXT,

    -- Audit Trail
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Verification Statistics Table
CREATE TABLE IF NOT EXISTS verification_stats (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,

    -- Creator Stats
    creator_pending INTEGER NOT NULL DEFAULT 0,
    creator_approved INTEGER NOT NULL DEFAULT 0,
    creator_rejected INTEGER NOT NULL DEFAULT 0,
    creator_total INTEGER NOT NULL DEFAULT 0,

    -- Co-Star Stats
    costar_pending INTEGER NOT NULL DEFAULT 0,
    costar_approved INTEGER NOT NULL DEFAULT 0,
    costar_rejected INTEGER NOT NULL DEFAULT 0,
    costar_total INTEGER NOT NULL DEFAULT 0,

    -- Combined Stats
    total_pending INTEGER NOT NULL DEFAULT 0,
    total_approved INTEGER NOT NULL DEFAULT 0,
    total_rejected INTEGER NOT NULL DEFAULT 0,
    total_verifications INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_creator_verifications_user_id ON creator_verifications(user_id);
CREATE INDEX idx_creator_verifications_status ON creator_verifications(status);
CREATE INDEX idx_creator_verifications_submitted_at ON creator_verifications(submitted_at DESC);
CREATE INDEX idx_creator_verifications_email ON creator_verifications(email_address);

CREATE INDEX idx_costar_verifications_user_id ON costar_verifications(user_id);
CREATE INDEX idx_costar_verifications_status ON costar_verifications(status);
CREATE INDEX idx_costar_verifications_submitted_at ON costar_verifications(submitted_at DESC);
CREATE INDEX idx_costar_verifications_primary_creator ON costar_verifications(primary_creator_legal_name);

CREATE INDEX idx_verification_audit_log_verification_id ON verification_audit_log(verification_id);
CREATE INDEX idx_verification_audit_log_timestamp ON verification_audit_log(timestamp DESC);

CREATE INDEX idx_verification_stats_date ON verification_stats(date DESC);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_creator_verifications_updated_at BEFORE UPDATE
    ON creator_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_costar_verifications_updated_at BEFORE UPDATE
    ON costar_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_stats_updated_at BEFORE UPDATE
    ON verification_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE creator_verifications IS 'Content Creator Identity Verification, 2257 Compliance, and Platform Agreement';
COMMENT ON TABLE costar_verifications IS 'Adult Co-Star Model Release + 2257 Compliance & Collaboration Agreement';
COMMENT ON TABLE verification_audit_log IS 'Audit trail for all verification actions';
COMMENT ON TABLE verification_stats IS 'Daily aggregated statistics for verification dashboard';
