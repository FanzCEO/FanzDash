# Production Login Information

## ✅ Setup Complete

The FANZDash production system is now live with real authentication.

## 🔐 Production Credentials

### Super Admin Account
- **Email:** `admin@fanzunlimited.com`
- **Password:** `FanzDash2024!SecurePass`
- **Role:** Super Admin
- **Clearance Level:** 5
- **Full Access:** All modules and features

### Demo Admin Account
- **Email:** `demo@fanzunlimited.com`
- **Password:** `DemoPass2024!`
- **Role:** Admin
- **Clearance Level:** 4
- **Limited Access:** Dashboard and content management

## 🌐 Access URLs

- **Production Dashboard:** https://fanzdash.onrender.com
- **Login Page:** https://fanzdash.onrender.com/login
- **API Base URL:** https://fanzdash.onrender.com/api

## 📋 Login Process

1. Navigate to: https://fanzdash.onrender.com/login
2. Enter email and password
3. Click "Sign In"
4. System will verify credentials and issue JWT token
5. Automatic redirect to dashboard

## 🔧 Authentication Features

✅ **Implemented:**
- JWT-based authentication
- Argon2 password hashing
- Role-based access control (RBAC)
- Clearance level permissions
- CSRF protection
- Secure session management
- Token refresh capability

## 🎯 User Roles & Permissions

### Super Admin (Level 5)
- Full system access
- User management
- Security settings
- Quantum Executive module
- All CRUD operations
- System configuration

### Admin (Level 4)
- Dashboard access
- Content moderation
- User viewing
- Limited configuration
- Read/write on assigned modules

### Moderator (Level 3)
- Content review
- User reports
- Limited dashboard access

### Creator (Level 2)
- Content upload
- Analytics viewing
- Profile management

### User (Level 1)
- Basic platform access
- Content consumption

## 🔒 Security Notes

1. **Change Default Passwords:** It's recommended to change the default passwords after first login
2. **Enable 2FA:** Two-factor authentication can be enabled in user settings
3. **Monitor Login Attempts:** The system locks accounts after 5 failed login attempts
4. **Session Duration:** JWT tokens expire after 24 hours
5. **Secure Headers:** All API requests require authentication headers

## 🧪 Testing Login

You can test the login API directly:

```bash
# Login as Super Admin
curl -X POST https://fanzdash.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fanzunlimited.com",
    "password": "FanzDash2024!SecurePass"
  }'

# Expected Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "id": "...",
#     "email": "admin@fanzunlimited.com",
#     "role": "super_admin",
#     "clearanceLevel": 5
#   }
# }
```

## 📊 Database Details

- **Host:** Supabase (PostgreSQL)
- **Connection:** Direct database with IPv4 add-on
- **Schema:** Fully migrated and aligned
- **Users Table:** Contains all authentication data
- **Password Hashing:** Argon2id (memory: 64MB, time: 3, parallelism: 4)

## 🚀 Next Steps

1. ✅ Login with super admin credentials
2. ✅ Verify dashboard access
3. ✅ Test all module permissions
4. 📝 Create additional admin users as needed
5. 🔐 Enable 2FA for super admin
6. 📧 Configure email verification
7. 🔔 Set up monitoring and alerts

## 🆘 Troubleshooting

### Login Failed
- Verify email and password are correct
- Check if account is locked (contact super admin)
- Ensure cookies are enabled

### Account Locked
```sql
-- Run in Supabase SQL Editor to unlock
UPDATE users 
SET account_locked = false, login_attempts = 0 
WHERE email = 'admin@fanzunlimited.com';
```

### Token Issues
- Clear browser cookies and cache
- Logout and login again
- Check token expiration (24 hours)

## 📞 Support

For issues or questions:
1. Check server logs in Render dashboard
2. Review Supabase logs for database errors
3. Contact system administrator

---

**Last Updated:** November 1, 2025  
**Status:** ✅ Production Ready  
**Authentication:** ✅ Real JWT Auth Active
