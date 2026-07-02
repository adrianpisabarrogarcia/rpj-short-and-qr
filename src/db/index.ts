import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = import.meta.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

// Wrap client initialization conditionally to allow build-time assets rendering
export const client = url ? createClient({
  url,
  authToken,
}) : null as any;

export const db = client ? drizzle(client, { schema }) : null as any;

