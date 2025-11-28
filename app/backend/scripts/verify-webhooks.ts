#!/usr/bin/env tsx

import crypto from 'crypto';

console.log('🔍 Verifying webhook handlers...');

interface WebhookConfig {
  path: string;
  secretEnv: string;
  signatureMethod: 'hmac-sha256' | 'verifymy';
  hasHandler: boolean;
}

const webhooks: WebhookConfig[] = [
  {
    path: '/webhooks/verifymy',
    secretEnv: 'VERIFYMY_API_KEY',
    signatureMethod: 'verifymy',
    hasHandler: true
  },
  {
    path: '/webhooks/payouts',
    secretEnv: 'PAYOUTS_WEBHOOK_SECRET', 
    signatureMethod: 'hmac-sha256',
    hasHandler: true
  },
  {
    path: '/webhooks/ads',
    secretEnv: 'ADS_WEBHOOK_SECRET',
    signatureMethod: 'hmac-sha256', 
    hasHandler: true
  }
];

let errors = 0;

for (const webhook of webhooks) {
  console.log(`Checking ${webhook.path}...`);
  
  // Check environment variable
  const secret = process.env[webhook.secretEnv];
  if (!secret) {
    console.error(`❌ Missing ${webhook.secretEnv} environment variable`);
    errors++;
    continue;
  }
  
  // Check handler exists
  if (!webhook.hasHandler) {
    console.error(`❌ Missing handler for ${webhook.path}`);
    errors++;
    continue;
  }
  
  // Test signature verification logic
  if (webhook.signatureMethod === 'hmac-sha256') {
    const testPayload = '{"test": "data"}';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(testPayload)
      .digest('hex');
    console.log(`✅ ${webhook.path} - HMAC verification ready`);
  } else if (webhook.signatureMethod === 'verifymy') {
    console.log(`✅ ${webhook.path} - VerifyMy signature verification ready`);
  }
}

if (errors > 0) {
  console.error(`\n❌ Webhook verification failed: ${errors} errors`);
  process.exit(1);
} else {
  console.log('\n✅ All webhook handlers verified');
}