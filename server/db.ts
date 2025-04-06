import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

// Use the DATABASE_URL environment variable provided by Replit
const connectionString = process.env.DATABASE_URL!;

// Create a pooled connection to the PostgreSQL database
const pool = new Pool({ connectionString });

// Create a Drizzle ORM instance with our schema
export const db = drizzle(pool, { schema });