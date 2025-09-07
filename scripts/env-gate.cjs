const required = [
  'DATABASE_URL',
  'S3_ENDPOINT','S3_REGION','S3_BUCKET','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY',
  'JWT_ISS','JWT_AUD','JWT_SECRET','JWT_ACCESS_TTL','JWT_REFRESH_TTL',
  'VERIFYMY_API_URL','VERIFYMY_API_KEY',
  'WEB_APP_URL','API_URL','NODE_ENV',
  // Security / Policy
  'OPA_POLICIES_BUCKET', 'OPA_BOOT_POLICY_PATH',
  'SIEM_ENDPOINT', 'SIEM_API_KEY',
  // Payouts / Finance
  'PAYOUTS_PROVIDER', 'PAYOUTS_WEBHOOK_SECRET',
  // Ads
  'ADS_WEBHOOK_SECRET',
  // Multi-tenant / SSO
  'TENANCY_MODE',             // single | multi
  'SSO_ISSUER', 'SSO_JWKS_URL'
];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing required env vars:\n' + missing.map(k => ` - ${k}`).join('\n'));
  process.exit(1);
}
console.log('✅ ENV check passed');