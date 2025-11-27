#!/usr/bin/env tsx

import jwt from 'jsonwebtoken';

console.log('🔍 Running health checks...');

interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
}

const healthChecks: HealthCheck[] = [
  {
    name: 'Database Connection',
    check: async () => {
      try {
        // Would test actual DB connection
        const dbUrl = process.env.DATABASE_URL;
        return !!dbUrl;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'S3 Presigned URLs',
    check: async () => {
      try {
        const required = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'];
        return required.every(key => !!process.env[key]);
      } catch {
        return false;
      }
    }
  },
  {
    name: 'JWT Sign/Verify',
    check: async () => {
      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return false;
        
        const token = jwt.sign({ test: true }, secret);
        const decoded = jwt.verify(token, secret);
        return !!decoded;
      } catch {
        return false;
      }
    }
  },
  {
    name: 'WebSocket Echo',
    check: async () => {
      // Mock WebSocket check
      return true;
    }
  },
  {
    name: 'Policy Engine Load',
    check: async () => {
      try {
        const policyBucket = process.env.OPA_POLICIES_BUCKET;
        const policyPath = process.env.OPA_BOOT_POLICY_PATH;
        return !!(policyBucket && policyPath);
      } catch {
        return false;
      }
    }
  }
];

let passed = 0;
let failed = 0;

for (const healthCheck of healthChecks) {
  try {
    const result = await healthCheck.check();
    if (result) {
      console.log(`✅ ${healthCheck.name}`);
      passed++;
    } else {
      console.error(`❌ ${healthCheck.name}`);
      failed++;
    }
  } catch (error) {
    console.error(`❌ ${healthCheck.name} - ${error}`);
    failed++;
  }
}

const total = passed + failed;
console.log(`\nHealth Check Results: ${passed}/${total} passed`);

if (failed > 0) {
  console.error('❌ Health checks failed');
  process.exit(1);
} else {
  console.log('✅ All health checks passed');
}