import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Google user ID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  picture: text('picture'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const urls = sqliteTable('urls', {
  id: text('id').primaryKey(), // The short code (e.g. 'abcxyz' or custom alias)
  originalUrl: text('original_url').notNull(),
  createdById: text('created_by_id').notNull().references(() => users.id),
  clicks: integer('clicks').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
