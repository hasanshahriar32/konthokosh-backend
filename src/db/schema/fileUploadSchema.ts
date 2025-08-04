import {
  serial,
  pgTable,
  varchar,
  timestamp,
  integer
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { users } from './users.js';

export const fileUploadsTable = pgTable('file_uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  chatId: integer('chat_id')
    .notNull(),
  fileName: varchar({ length: 255 }).notNull(),
  fileUrl: varchar({ length: 2083 }).notNull().unique(),
  uploadedAt: timestamp().defaultNow().notNull(),
  pageCount: integer('page_count'),
});

export const createFileUploadSchema = createInsertSchema(fileUploadsTable).omit({
  id: true,
  uploadedAt: true,
});