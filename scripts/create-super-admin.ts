/**
 * Create Super Admin User
 * Run this script to create the initial super admin user with proper password hashing
 */

import argon2 from 'argon2';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { sql } from 'drizzle-orm';

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(sql`${users.email} = 'admin@fanzunlimited.com'`)
      .limit(1);

    if (existing) {
      console.log('✅ Super admin already exists');
      return;
    }

    // Hash password
    const passwordHash = await argon2.hash('FanzDash2024!');

    // Create super admin
    const [superAdmin] = await db
      .insert(users)
      .values({
        username: 'superadmin',
        email: 'admin@fanzunlimited.com',
        passwordHash: passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        clearanceLevel: 5,
        vaultAccess: true,
        fanzIdEnabled: true,
        emailVerified: true,
        isActive: true,
        accountLocked: false,
        loginAttempts: 0,
        modulePermissions: { '*': '*' },
      })
      .returning();

    console.log('✅ Super admin created successfully!');
    console.log('Email: admin@fanzunlimited.com');
    console.log('Password: FanzDash2024!');
    console.log('User ID:', superAdmin.id);

    // Create demo user
    const demoPasswordHash = await argon2.hash('Demo2024!');

    const [demoUser] = await db
      .insert(users)
      .values({
        username: 'demo',
        email: 'demo@fanzunlimited.com',
        passwordHash: demoPasswordHash,
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
        clearanceLevel: 4,
        vaultAccess: false,
        fanzIdEnabled: false,
        emailVerified: true,
        isActive: true,
        accountLocked: false,
        loginAttempts: 0,
        modulePermissions: { read: ['*'], write: ['dashboard', 'content'] },
      })
      .returning();

    console.log('✅ Demo user created successfully!');
    console.log('Email: demo@fanzunlimited.com');
    console.log('Password: Demo2024!');
    console.log('User ID:', demoUser.id);

  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  }
}

createSuperAdmin()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

