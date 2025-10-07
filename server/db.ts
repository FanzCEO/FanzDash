import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if we have a valid database URL
const databaseUrl = process.env.DATABASE_URL;
const isValidUrl = databaseUrl && !databaseUrl.includes("username:password@localhost");

let pool: any, db: any;

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
} else {
  // Production database connection
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
}

export { pool, db };
