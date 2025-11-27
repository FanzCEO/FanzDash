#!/usr/bin/env tsx

import { db } from '../src/db';
import { 
  users, tenants, memberships, auditLogs, kycVerifications,
  payoutRequests, adCreatives, adPlacements, globalFlags,
  opaPolicies, securityEvents, webhooks, apiKeys
} from '../../../shared/schema';
import { hashPassword } from '../src/auth/utils';

console.log('🌱 Seeding enterprise database...');

async function seed() {
  // Create tenants
  const [boyfanzTenant, fanzcommerceTenant] = await db.insert(tenants).values([
    {
      slug: 'boyfanz',
      name: 'BoyFanz',
      ssoDomain: 'boyfanz.com',
      status: 'active'
    },
    {
      slug: 'fanzcommerce', 
      name: 'FanzCommerce',
      ssoDomain: 'fanzcommerce.com',
      status: 'active'
    }
  ]).returning();

  console.log('✅ Created tenants:', boyfanzTenant.name, fanzcommerceTenant.name);

  // Create superadmin
  const hashedPassword = await hashPassword('Super!234');
  const [superadmin] = await db.insert(users).values({
    email: 'superadmin@fanzdash.app',
    passwordHash: hashedPassword,
    globalRole: 'superadmin',
    status: 'active'
  }).returning();

  // Create tenant admins and staff
  const [modReviewer1, modReviewer2, financeAdmin, securityAdmin] = await db.insert(users).values([
    {
      email: 'mod1@fanzdash.app',
      passwordHash: await hashPassword('Mod1Pass!'),
      globalRole: 'reviewer',
      status: 'active'
    },
    {
      email: 'mod2@fanzdash.app', 
      passwordHash: await hashPassword('Mod2Pass!'),
      globalRole: 'reviewer',
      status: 'active'
    },
    {
      email: 'finance@fanzdash.app',
      passwordHash: await hashPassword('FinancePass!'),
      globalRole: 'finance',
      status: 'active'
    },
    {
      email: 'security@fanzdash.app',
      passwordHash: await hashPassword('SecurityPass!'),
      globalRole: 'security', 
      status: 'active'
    }
  ]).returning();

  console.log('✅ Created admin users');

  // Create sample policies
  await db.insert(opaPolicies).values([
    {
      name: 'adult-media-default',
      version: '1.0.0',
      regoS3Key: 'policies/adult-media-default.rego',
      active: true,
      notes: 'Default adult content policy'
    },
    {
      name: 'payout-approval',
      version: '1.0.0', 
      regoS3Key: 'policies/payout-approval.rego',
      active: true,
      notes: 'Automated payout approval rules'
    }
  ]);

  console.log('✅ Created sample policies');

  // Create sample ads and placements
  const [adCreative] = await db.insert(adCreatives).values({
    advertiserId: 'advertiser-1',
    type: 'banner',
    metaJson: { size: '728x90', format: 'image/jpeg' },
    status: 'pending'
  }).returning();

  await db.insert(adPlacements).values([
    {
      platform: 'fanzroulette',
      slot: 'header-banner',
      capsJson: { dailyCap: 10000, hourlyRate: 100 },
      rateCardJson: { cpm: 5.0, minBid: 0.10 }
    },
    {
      platform: 'fanztube',
      slot: 'pre-roll',
      capsJson: { dailyCap: 50000, hourlyRate: 500 },
      rateCardJson: { cpm: 8.0, minBid: 0.25 }
    }
  ]);

  console.log('✅ Created sample ads and placements');

  // Create sample payout requests
  await db.insert(payoutRequests).values([
    {
      userId: modReviewer1.id,
      amountCents: 50000, // $500
      currency: 'USD',
      status: 'pending',
      providerRef: null
    },
    {
      userId: modReviewer2.id,
      amountCents: 75000, // $750
      currency: 'USD', 
      status: 'approved',
      providerRef: 'payout_abc123'
    }
  ]);

  console.log('✅ Created sample payout requests');

  // Create sample KYC entries
  await db.insert(kycVerifications).values([
    {
      userId: modReviewer1.id,
      provider: 'verifymy',
      status: 'verified',
      externalId: 'vm_user_12345',
      dataJson: { 
        firstName: 'John',
        lastName: 'Reviewer',
        documentType: 'passport',
        verifiedAt: new Date().toISOString()
      }
    }
  ]);

  console.log('✅ Created sample KYC entries');

  // Create feature flags
  await db.insert(globalFlags).values([
    {
      flagKey: 'uploads_enabled',
      valueJson: { enabled: true },
      tenantId: null, // Global
      platform: null,
      rolloutPercent: 100
    },
    {
      flagKey: 'payouts_enabled',
      valueJson: { enabled: false }, // Disabled by default
      tenantId: null,
      platform: null, 
      rolloutPercent: 0
    },
    {
      flagKey: 'ads_serving',
      valueJson: { enabled: true },
      tenantId: boyfanzTenant.id,
      platform: 'fanzroulette',
      rolloutPercent: 50 // 50% rollout
    }
  ]);

  console.log('✅ Created feature flags');

  // Create audit log entry
  await db.insert(auditLogs).values({
    actorId: superadmin.id,
    tenantId: null,
    action: 'database_seeded',
    targetType: 'system',
    targetId: 'fanzdash',
    diffJson: {
      operation: 'initial_seed',
      timestamp: new Date().toISOString()
    }
  });

  console.log('✅ Database seeding completed successfully');
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});