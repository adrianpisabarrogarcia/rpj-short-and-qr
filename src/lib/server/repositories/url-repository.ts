import { db } from '../../../db';
import { urls } from '../../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { ShortUrl } from '../../../types/url';

export async function findBySlug(slug: string): Promise<ShortUrl | null> {
  const rows = await db.select().from(urls).where(eq(urls.id, slug)).limit(1);
  return rows[0] ?? null;
}

export async function findByOwnedSlug(slug: string, ownerId: string): Promise<ShortUrl | null> {
  const rows = await db
    .select()
    .from(urls)
    .where(and(eq(urls.id, slug), eq(urls.createdById, ownerId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findByUser(userId: string): Promise<ShortUrl[]> {
  const rows: ShortUrl[] = await db.select().from(urls).where(eq(urls.createdById, userId));
  return rows.sort((a: ShortUrl, b: ShortUrl) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function existsSlug(slug: string): Promise<boolean> {
  const rows = await db.select().from(urls).where(eq(urls.id, slug)).limit(1);
  return rows.length > 0;
}

export async function insert(data: {
  id: string;
  originalUrl: string;
  createdById: string;
  clicks: number;
  createdAt: Date;
}): Promise<void> {
  await db.insert(urls).values(data);
}

export async function updateOriginalUrl(slug: string, originalUrl: string): Promise<void> {
  await db.update(urls).set({ originalUrl }).where(eq(urls.id, slug));
}

export async function remove(slug: string): Promise<void> {
  await db.delete(urls).where(eq(urls.id, slug));
}

export async function replaceSlug(
  oldSlug: string,
  newRecord: { id: string; originalUrl: string; createdById: string; clicks: number; createdAt: Date }
): Promise<void> {
  await db.transaction(async (tx: typeof db) => {
    await tx.delete(urls).where(eq(urls.id, oldSlug));
    await tx.insert(urls).values(newRecord);
  });
}

export async function incrementClicks(slug: string): Promise<void> {
  await db
    .update(urls)
    .set({ clicks: sql`${urls.clicks} + 1` })
    .where(eq(urls.id, slug));
}
