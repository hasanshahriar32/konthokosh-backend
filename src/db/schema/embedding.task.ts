import { pgTable, serial, text, varchar, jsonb, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { projects } from './project';

interface EmbeddingPaper {
  paperId: number;
  title: string;
  blobUrl: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  errorMessage?: string;
}

export const embeddingTasks = pgTable('embedding_tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  taskId: varchar('task_id', { length: 255 }).notNull(), // External service task ID
  searchId: integer('search_id').notNull(),
  totalPapers: integer('total_papers').notNull(),
  uploadedCount: integer('uploaded_count').notNull(),
  papers: jsonb('papers').$type<EmbeddingPaper[]>().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, completed, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type EmbeddingTask = typeof embeddingTasks.$inferSelect;
export type NewEmbeddingTask = typeof embeddingTasks.$inferInsert;
