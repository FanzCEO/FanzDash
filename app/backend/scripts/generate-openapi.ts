#!/usr/bin/env tsx

import { generateSchema } from '@anatine/zod-openapi';
import { 
  insertUserSchema, insertContentItemSchema, insertModerationResultSchema,
  insertTenantSchema, insertAuditLogSchema, insertKycVerificationSchema,
  insertPayoutRequestSchema, insertAdCreativeSchema 
} from '../../../shared/schema.js';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

// Generate OpenAPI spec from Zod schemas
const spec: OpenAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'FANZDash Super-Admin API',
    version: '1.0.0',
    description: 'Enterprise multi-tenant super-admin control center for FUN ecosystem'
  },
  servers: [
    { url: '/api', description: 'FANZDash API' }
  ],
  paths: {
    '/api/auth/login': {
      post: {
        summary: 'Admin login',
        tags: ['Authentication'],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        }
      }
    },
    '/api/tenants': {
      get: {
        summary: 'List tenants',
        tags: ['Multi-Tenant'],
        responses: {
          '200': { description: 'Success' }
        }
      },
      post: {
        summary: 'Create tenant',
        tags: ['Multi-Tenant'],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/InsertTenant' }
            }
          }
        }
      }
    },
    '/api/users': {
      get: { summary: 'List users', tags: ['Users'] },
      post: { summary: 'Create user', tags: ['Users'] }
    },
    '/api/moderation/queue': {
      get: { summary: 'Get moderation queue', tags: ['Moderation'] }
    },
    '/api/compliance/kyc': {
      get: { summary: 'KYC verification dashboard', tags: ['Compliance'] }
    },
    '/api/payouts': {
      get: { summary: 'List payout requests', tags: ['Payouts'] }
    },
    '/api/ads/review': {
      get: { summary: 'Ad review queue', tags: ['Ads'] }
    },
    '/api/security/events': {
      get: { summary: 'Security events feed', tags: ['Security'] }
    },
    '/api/feature-flags': {
      get: { summary: 'Feature flags management', tags: ['Feature Flags'] }
    },
    '/webhooks/verifymy': {
      post: { summary: 'VerifyMy KYC webhook', tags: ['Webhooks'] }
    },
    '/webhooks/payouts': {
      post: { summary: 'Payouts provider webhook', tags: ['Webhooks'] }
    },
    '/webhooks/ads': {
      post: { summary: 'Ads review webhook', tags: ['Webhooks'] }
    }
  },
  components: {
    schemas: {
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        }
      },
      InsertUser: generateSchema(insertUserSchema),
      InsertContentItem: generateSchema(insertContentItemSchema),
      InsertModerationResult: generateSchema(insertModerationResultSchema)
    }
  }
};

console.log(JSON.stringify(spec, null, 2));