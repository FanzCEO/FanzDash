/**
 * Database Connection for FanzDash
 * 
 * This is the main database connection file used throughout the server.
 * Supports Supabase and Neon Serverless with automatic detection.
 */

import * as schema from "@shared/schema";

// Import both drivers - let esbuild tree-shake
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import ws from "ws";

// Environment configuration
const databaseUrl = process.env.DATABASE_URL;
const supabaseUrl = process.env.SUPABASE_URL;
const isSupabase = databaseUrl?.includes('supabase.co') || Boolean(supabaseUrl);
const isValidUrl = databaseUrl && !databaseUrl.includes("username:password@localhost");

let pool: any, db: any;

// Determine database type and initialize
if (!isValidUrl) {
  console.warn("⚠️  Using mock database for development. Set a real DATABASE_URL for production.");
  
  // Create mock implementations
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
  console.log("🔗 Connecting to Supabase database using node-postgres");
  
  pool = new PgPool({
    connectionString: databaseUrl,
    max: 20, // Max connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  db = pgDrizzle(pool, { schema });
  
  // Test connection
  pool.query('SELECT 1')
    .then(() => console.log('✅ Supabase database connected successfully'))
    .catch((error: Error) => console.error('❌ Supabase database connection failed:', error));
  
} else {
  // Neon Serverless connection - use neon serverless driver
  console.log("🔗 Connecting to Neon Serverless database");
  
  neonConfig.webSocketConstructor = ws;
  
  pool = new NeonPool({
    connectionString: databaseUrl,
  });
  
  db = neonDrizzle(pool, { schema });
  
  // Test connection
  pool.query('SELECT 1')
    .then(() => console.log('✅ Neon database connected successfully'))
    .catch((error: Error) => console.error('❌ Neon database connection failed:', error));
}

export { pool, db };
