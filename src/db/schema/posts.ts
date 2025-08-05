import {
  pgTable,
  serial,
  varchar,
  boolean,
  timestamp,
  jsonb,
  text,
  integer,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from './users';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  post: text('post').notNull(), // The actual post content
  userId: integer('user_id').references(() => users.id).notNull(), // Foreign key to users table
  isApproved: boolean('is_approved').default(false), // Approval status
  imagesId: jsonb('images_id').default([]), // Array of image IDs, can be null/empty
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts);
export const selectPostSchema = createSelectSchema(posts);

// Type definitions for better TypeScript support
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
