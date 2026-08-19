import { db } from '../../../db';
import { users } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function findById(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function upsertFromGoogleProfile(profile: GoogleProfile): Promise<void> {
  await db
    .insert(users)
    .values({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture || '',
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: profile.name,
        picture: profile.picture || '',
      },
    });
}
