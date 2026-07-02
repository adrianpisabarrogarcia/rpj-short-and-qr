import jwt from 'jsonwebtoken';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = import.meta.env.JWT_SECRET || process.env.JWT_SECRET || 'fallback-secret-for-dev-only';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function generateToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getUserFromSession(request: Request): Promise<SessionUser | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => c.trim().split('='))
  );
  
  const token = cookies['session_token'];
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Optional double-check with DB to ensure user still exists
  try {
    const found = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
    if (found.length === 0) return null;
    return decoded;
  } catch {
    return decoded; // Fallback to token decoded payload if DB is temporarily offline
  }
}
