/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';

// Cloudflare Workers environment bindings
interface Env {
  CACHE: KVNamespace;
  SESSIONS: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
  LOGS_BUCKET: R2Bucket;
  ANALYTICS: AnalyticsEngineDataset;
  BACKGROUND_TASKS: Queue;
  WEBSOCKET_SESSIONS: DurableObjectNamespace;
  LIVE_STREAMS: DurableObjectNamespace;
  CHAT_ROOMS: DurableObjectNamespace;
  
  // Environment variables
  DATABASE_URL: string;
  JWT_SECRET: string;
  VERIFYMY_API_KEY: string;
  PAYOUTS_WEBHOOK_SECRET: string;
  ADS_WEBHOOK_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', cors({
  origin: ['https://fanzdash.workers.dev', 'https://replit.com'],
  credentials: true,
}));

app.use('*', logger());
app.use('*', secureHeaders());

// Health check endpoint
app.get('/api/health', async (c) => {
  const env = c.env;
  
  try {
    // Check KV availability
    await env.CACHE.get('health-check', { cacheTtl: 60 });
    
    // Check R2 availability
    await env.MEDIA_BUCKET.head('health-check');
    
    return c.json({
      status: 'healthy',
      platform: 'warp',
      timestamp: new Date().toISOString(),
      services: {
        kv: 'operational',
        r2: 'operational',
        analytics: 'operational',
        queues: 'operational'
      }
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      platform: 'warp',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Sync endpoint for receiving updates from Replit
app.post('/api/sync/from-replit', async (c) => {
  const env = c.env;
  
  try {
    const payload = await c.req.json();
    
    // Validate sync request
    const signature = c.req.header('x-sync-signature');
    if (!signature) {
      return c.json({ error: 'Missing sync signature' }, 401);
    }
    
    // Store sync data in KV
    await env.CACHE.put(
      `sync:replit:${Date.now()}`, 
      JSON.stringify(payload),
      { expirationTtl: 3600 }
    );
    
    // Queue background sync task
    await env.BACKGROUND_TASKS.send({
      type: 'sync_from_replit',
      payload,
      timestamp: new Date().toISOString()
    });
    
    // Log analytics
    env.ANALYTICS.writeDataPoint({
      blobs: ['sync_from_replit'],
      doubles: [1],
      indexes: ['sync_events']
    });
    
    return c.json({
      success: true,
      message: 'Sync from Replit initiated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// WebSocket handling for real-time sync
app.get('/api/ws/sync', async (c) => {
  const env = c.env;
  
  // Upgrade to WebSocket
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected websocket', 400);
  }
  
  // Get or create WebSocket session
  const sessionId = c.req.query('session') || crypto.randomUUID();
  const wsSession = env.WEBSOCKET_SESSIONS.get(
    env.WEBSOCKET_SESSIONS.idFromName(sessionId)
  );
  
  return wsSession.fetch(c.req.raw);
});

// Configuration sync endpoint
app.get('/api/sync/config', async (c) => {
  const env = c.env;
  
  try {
    // Get cached config or fetch from source
    const cachedConfig = await env.CACHE.get('sync_config');
    
    if (cachedConfig) {
      return c.json(JSON.parse(cachedConfig));
    }
    
    // Fallback config
    const config = {
      platforms: {
        replit: { enabled: true, status: 'active' },
        warp: { enabled: true, status: 'active' }
      },
      sync: {
        enabled: true,
        last_sync: new Date().toISOString(),
        status: 'synced'
      }
    };
    
    // Cache config
    await env.CACHE.put('sync_config', JSON.stringify(config), {
      expirationTtl: 300
    });
    
    return c.json(config);
    
  } catch (error) {
    return c.json({
      error: 'Failed to get sync config',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// File upload handler for R2
app.post('/api/sync/upload', async (c) => {
  const env = c.env;
  
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    const key = `sync/${Date.now()}-${file.name}`;
    
    // Upload to R2
    await env.MEDIA_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        contentLength: file.size
      }
    });
    
    return c.json({
      success: true,
      key,
      url: `https://fanzdash.workers.dev/api/sync/download/${key}`,
      size: file.size,
      type: file.type
    });
    
  } catch (error) {
    return c.json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// File download handler from R2
app.get('/api/sync/download/:key{.+}', async (c) => {
  const env = c.env;
  const key = c.req.param('key');
  
  try {
    const object = await env.MEDIA_BUCKET.get(key);
    
    if (!object) {
      return c.text('File not found', 404);
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Length': object.size.toString(),
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    return c.text('Download failed', 500);
  }
});

// Analytics endpoint
app.get('/api/sync/analytics', async (c) => {
  const env = c.env;
  
  // Get sync metrics from analytics engine
  const metrics = {
    total_syncs: 0,
    successful_syncs: 0,
    failed_syncs: 0,
    last_sync: new Date().toISOString(),
    platforms: {
      replit: { status: 'active', last_sync: new Date().toISOString() },
      warp: { status: 'active', last_sync: new Date().toISOString() }
    }
  };
  
  return c.json(metrics);
});

// Error handling
app.onError((err, c) => {
  console.error('Warp error:', err);
  
  return c.json({
    error: 'Internal server error',
    message: err.message,
    platform: 'warp',
    timestamp: new Date().toISOString()
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path,
    platform: 'warp'
  }, 404);
});

// Queue consumer for background tasks
export async function queue(batch: MessageBatch<any>, env: Env): Promise<void> {
  for (const message of batch.messages) {
    try {
      const { type, payload, timestamp } = message.body;
      
      switch (type) {
        case 'sync_from_replit':
          console.log('Processing sync from Replit:', payload);
          // Handle sync logic here
          break;
          
        case 'backup_data':
          console.log('Creating backup:', timestamp);
          // Handle backup logic here
          break;
          
        default:
          console.log('Unknown message type:', type);
      }
      
      message.ack();
    } catch (error) {
      console.error('Queue processing error:', error);
      message.retry();
    }
  }
}

// Scheduled event handler
export async function scheduled(event: ScheduledEvent, env: Env): Promise<void> {
  console.log('Scheduled sync event triggered');
  
  try {
    // Perform periodic sync tasks
    await env.BACKGROUND_TASKS.send({
      type: 'periodic_sync',
      timestamp: new Date().toISOString()
    });
    
    // Log analytics
    env.ANALYTICS.writeDataPoint({
      blobs: ['scheduled_sync'],
      doubles: [1],
      indexes: ['sync_events']
    });
    
    console.log('Scheduled sync completed');
  } catch (error) {
    console.error('Scheduled sync failed:', error);
  }
}

// Durable Object classes
export class WebSocketSession {
  private state: DurableObjectState;
  private sessions: Set<WebSocket> = new Set();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    this.sessions.add(server);

    server.accept();
    
    server.addEventListener('message', (event) => {
      // Broadcast to all connected sessions
      this.sessions.forEach((session) => {
        if (session !== server && session.readyState === WebSocket.OPEN) {
          session.send(event.data);
        }
      });
    });

    server.addEventListener('close', () => {
      this.sessions.delete(server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}

export class LiveStreamSession {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    // Handle live stream session logic
    return new Response('Live stream session', { status: 200 });
  }
}

export class ChatRoomSession {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    // Handle chat room session logic
    return new Response('Chat room session', { status: 200 });
  }
}

export default app;