# Super Admin Setup Instructions

## Current Status

**Authentication:** ✅ Real JWT authentication is now implemented  
**Demo Mode:** ❌ Removed - production-ready authentication  
**Login Page:** ✅ Available at https://fanzdash.onrender.com/login

## Setting Up the Initial Super Admin

Since password hashing uses Argon2 (which requires the application), you have two options:

### Option 1: Use the Registration Endpoint (Recommended)

1. **Temporarily allow registration:**
   - Currently only super admins can access the system
   - You'll need to create the first admin through the database

2. **Or use curl to register:**
```bash
curl -X POST https://fanzdash.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fanzunlimited.com",
    "password": "FanzDash2024!",
    "firstName": "Super",
    "lastName": "Admin",
    "username": "superadmin"
  }'
```

3. **Then manually update the role:**
   - Go to Supabase SQL Editor
   - Run:
```sql
UPDATE users 
SET 
  role = 'super_admin',
  clearance_level = 5,
  vault_access = true,
  fanz_id_enabled = true,
  email_verified = true
WHERE email = 'admin@fanzunlimited.com';
```

### Option 2: Direct Database Insert (Using Pre-hashed Password)

**This requires generating an Argon2 hash first**

You can use the `scripts/create-super-admin.ts` script locally to generate the hash:

```bash
# Run locally (requires database connection)
npm run tsx scripts/create-super-admin.ts
```

This will output a pre-hashed password you can insert into the database.

### Option 3: Supabase Dashboard SQL Editor (Quick Setup)

1. Go to: https://supabase.com/dashboard/project/eglawbjqtbsofofdqfzr/sql/new

2. Run this SQL (creates a user, but password won't work until you set it):

```sql
-- Insert super admin (password will be set later via app)
INSERT INTO public.users (
  username,
  email,
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
  'superadmin',
  'admin@fanzunlimited.com',
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
  '{"*": "*"}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Insert demo user
INSERT INTO public.users (
  username,
  email,
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
  'demo',
  'demo@fanzunlimited.com',
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
  '{"read": ["*"], "write": ["dashboard", "content"]}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

3. **Then set passwords through the app's password change API** (if available) or wait for the app deployment to complete and use the registration flow.

## Quick Start: Use Registration API

The easiest way is to use the registration API, then upgrade the user to super admin:

```bash
# Step 1: Register
curl -X POST https://fanzdash.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fanzunlimited.com",
    "password": "FanzDash2024!SecurePass",
    "firstName": "Super",
    "lastName": "Admin", 
    "username": "superadmin"
  }'

# Step 2: Upgrade to super admin via Supabase SQL
UPDATE users 
SET role = 'super_admin', clearance_level = 5, vault_access = true 
WHERE email = 'admin@fanzunlimited.com';
```

## Default Credentials (After Setup)

**Super Admin:**
- Email: `admin@fanzunlimited.com`
- Password: `FanzDash2024!SecurePass` (or whatever you set)
- Role: Super Admin
- Clearance: Level 5

**Demo Admin:**
- Email: `demo@fanzunlimited.com`
- Password: Set via registration or app
- Role: Admin
- Clearance: Level 4

## Testing Login

Once the user is created:

1. Go to: https://fanzdash.onrender.com/login
2. Enter email and password
3. Should receive a JWT token
4. Will be redirected to dashboard

## Security Checklist

- [ ] Create super admin account
- [ ] Change default password
- [ ] Enable 2FA (if available)
- [ ] Review user permissions
- [ ] Set up OAuth providers (optional)
- [ ] Configure email verification
- [ ] Review login logs
- [ ] Set up monitoring

## Troubleshooting

**"Authentication required" on all pages:**
- User hasn't logged in yet
- Go to /login first

**"Invalid credentials":**
- User doesn't exist in database
- Password hash is wrong
- Account might be locked

**"Account is locked":**
```sql
UPDATE users 
SET account_locked = false, login_attempts = 0 
WHERE email = 'admin@fanzunlimited.com';
```

## Next Steps

1. Create the super admin using one of the methods above
2. Test login at https://fanzdash.onrender.com/login
3. Access dashboard with super admin permissions
4. Create additional admin accounts as needed
5. Configure platform settings
6. Enable security features

