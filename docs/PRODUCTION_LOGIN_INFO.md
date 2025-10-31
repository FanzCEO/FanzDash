# Production Login Credentials

## Initial Super Admin Account

**URL:** https://fanzdash.onrender.com/login

**Super Admin:**
- Email: `admin@fanzunlimited.com`
- Password: `FanzDash2024!`
- Role: Super Admin
- Clearance Level: 5

**Demo Admin Account:**
- Email: `demo@fanzunlimited.com`
- Password: `Demo2024!`
- Role: Admin
- Clearance Level: 4

## How to Create the Super Admin

You need to create the super admin user through the application's registration system or directly in Supabase:

### Option 1: Using Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/eglawbjqtbsofofdqfzr/sql/new
2. Run this SQL:

```sql
-- Create super admin (using Argon2 hashing via the app)
-- Note: This creates a placeholder - you'll need to update the password hash
-- using the app's change password feature after first login
```

### Option 2: Using the API

The app has registration endpoints at:
- `POST /api/auth/register`
- `POST /api/auth/login`

Use these to create and login with the super admin account.

### Option 3: Temporary Demo Mode

For initial setup, the app can temporarily use demo mode authentication. After you create the super admin, demo mode should be disabled.

## Security Notes

1. **Change Default Passwords:** Immediately change the default passwords after first login
2. **Enable 2FA:** Set up two-factor authentication for super admin accounts
3. **Rotate JWT Secret:** Ensure `JWT_SECRET` environment variable is set to a secure random value
4. **Limit Admin Access:** Only grant admin access to trusted personnel

## Authentication Methods

The app supports multiple authentication methods:

1. **Email/Password** - Local authentication with Argon2 hashing
2. **OAuth** - Google, GitHub, Facebook, Twitter, LinkedIn (if configured)
3. **Supabase Auth** - If using Supabase authentication
4. **API Keys** - For server-to-server communication

## Current Authentication Status

**Status:** Real JWT authentication is implemented
**Demo Mode:** Can be toggled on/off
**Password Hashing:** Argon2 with secure parameters
**Session Duration:** 24 hours default

## Next Steps

1. Create the super admin account via one of the options above
2. Test login at https://fanzdash.onrender.com/login
3. Configure additional security settings
4. Set up OAuth providers if needed
5. Create additional admin accounts as needed

