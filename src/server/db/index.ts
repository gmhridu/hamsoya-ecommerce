import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';
import { env } from '@/env'; // We'll create this later

// Create a connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Initialize drizzle with schema
export const db = drizzle(pool, { schema });
