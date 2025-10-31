-- Migration: Create initial super admin user
-- This creates the first super admin with full access

-- First, ensure we have the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create super admin user
INSERT INTO public.users (
  id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  clearance_level,
  vault_access,
  fanz_id_enabled,
  email_verified,
  is_active,
  account_locked,
  login_attempts,
  module_permissions,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'superadmin',
  'admin@fanzunlimited.com',
  '$argon2id$v=19$m=65536,t=3,p=4$' || encode(gen_random_bytes(16), 'base64') || '$' || encode(crypt('FanzDash2024!', gen_salt('bf'))::bytea, 'base64'),
  'Super',
  'Admin',
  'super_admin',
  5,
  true,
  true,
  true,
  true,
  false,
  0,
  '{"*": "*"}',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Also create a demo user for testing
INSERT INTO public.users (
  id,
  username,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  clearance_level,
  vault_access,
  fanz_id_enabled,
  email_verified,
  is_active,
  account_locked,
  login_attempts,
  module_permissions,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid()::text,
  'demo',
  'demo@fanzunlimited.com',
  '$argon2id$v=19$m=65536,t=3,p=4$' || encode(gen_random_bytes(16), 'base64') || '$' || encode(crypt('Demo2024!', gen_salt('bf'))::bytea, 'base64'),
  'Demo',
  'User',
  'admin',
  4,
  false,
  false,
  true,
  true,
  false,
  0,
  '{"read": ["*"], "write": ["dashboard", "content"]}',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Note: For production, you should use Argon2 hashing through the application
-- The above uses bcrypt as a fallback through PostgreSQL's crypt function
-- To properly set up the admin password, use the application's registration/update endpoint

