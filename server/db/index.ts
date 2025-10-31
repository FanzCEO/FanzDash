/**
 * Database Connection for FanzDash
 *
 * Supports:
 * - Supabase (preferred) - uses node-postgres (pg)
 * - Neon Serverless - uses neon serverless driver
 * - Mock database for development
 */

import * as schema from "@shared/schema";
import { dbLogger } from '../utils/logger';

// Environment configuration
const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const isSupabase = databaseUrl?.includes('supabase.co') || Boolean(supabaseUrl);
const isValidUrl = databaseUrl && !databaseUrl.includes("username:password@localhost");

let pool: any, db: any;

// Determine database type and initialize
if (!isValidUrl) {
  // Mock database for development
  dbLogger.warn("Using mock database for development. Set DATABASE_URL for production.");

  pool = {
    query: () => Promise.resolve({ rows: [] }),
    connect: () => Promise.resolve({
      query: () => Promise.resolve({ rows: [] }),
      release: () => Promise.resolve()
    }),
    end: () => Promise.resolve()
  } as any;

  db = new Proxy({}, {
    get() {
      return () => Promise.resolve([]);
    }
  }) as any;

} else if (isSupabase) {
  // Supabase connection - use node-postgres (pg)
  dbLogger.info("Connecting to Supabase database using node-postgres");

  // Dynamic import to avoid loading issues
  const { Pool } = require('pg');
  const { drizzle } = require('drizzle-orm/node-postgres');

  pool = new Pool({
    connectionString: databaseUrl,
    max: 20, // Max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  db = drizzle(pool, { schema });

  // Test connection
  pool.query('SELECT 1')
    .then(() => dbLogger.info('Supabase database connected successfully'))
    .catch((error: Error) => dbLogger.error('Supabase database connection failed', error));

} else {
  // Neon Serverless connection
  dbLogger.info("Connecting to Neon Serverless database");

  // Dynamic import to avoid loading issues
  const { Pool, neonConfig } = require("@neondatabase/serverless");
  const { drizzle } = require("drizzle-orm/neon-serverless");
  const ws = require("ws");

  neonConfig.webSocketConstructor = ws;

  pool = new Pool({
    connectionString: databaseUrl,
  });

  db = drizzle(pool, { schema });

  // Test connection
  pool.query('SELECT 1')
    .then(() => dbLogger.info('Neon database connected successfully'))
    .catch((error: Error) => dbLogger.error('Neon database connection failed', error));
}

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  type: 'supabase' | 'neon' | 'mock';
  latency?: number;
}> {
  if (!isValidUrl) {
    return { healthy: true, type: 'mock' };
  }

  const start = Date.now();

  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - start;

    return {
      healthy: true,
      type: isSupabase ? 'supabase' : 'neon',
      latency
    };
  } catch (error) {
    dbLogger.error('Database health check failed', error as Error);
    return {
      healthy: false,
      type: isSupabase ? 'supabase' : 'neon'
    };
  }
}

/**
 * Execute raw SQL query with logging
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();

  try {
    const result = await pool.query(sql, params);
    const duration = Date.now() - start;

    dbLogger.database('query', 'raw-sql', duration);
    return result.rows as T[];
  } catch (error) {
    const duration = Date.now() - start;
    dbLogger.database('query', 'raw-sql', duration, error as Error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  activeConnections?: number;
  idleConnections?: number;
  totalConnections?: number;
}> {
  try {
    const result = await pool.query(`
      SELECT
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) as total
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    return {
      activeConnections: parseInt(result.rows[0]?.active || '0'),
      idleConnections: parseInt(result.rows[0]?.idle || '0'),
      totalConnections: parseInt(result.rows[0]?.total || '0')
    };
  } catch (error) {
    dbLogger.error('Failed to get database stats', error as Error);
    return {};
  }
}

/**
 * Graceful shutdown
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await pool.end();
    dbLogger.info('Database connection closed gracefully');
  } catch (error) {
    dbLogger.error('Error closing database connection', error as Error);
  }
}

// Export pool and db instance
export { pool, db };

// Export as default for backward compatibility
export default db;
