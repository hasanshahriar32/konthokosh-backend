import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  vector,
} from 'drizzle-orm/pg-core';
import { fileUploadsTable } from './fileUploadSchema';

// Each row represents a chunk of text from a PDF file, along with its embedding vector.
export const pdfEmbeddingsTable = pgTable('pdf_embeddings', {
  id: serial('id').primaryKey(),
  fileId: integer('file_id')
    .references(() => fileUploadsTable.id, { onDelete: 'cascade' })
    .notNull(),
  chunkText: text('chunk_text').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  chunkIndex: integer('chunk_index'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
