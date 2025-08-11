import { pgTable, serial, integer, text, timestamp, vector, index } from 'drizzle-orm/pg-core';
import { posts } from './posts';

export const postEmbeddings = pgTable('post_embeddings', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id).notNull(),
  embedding: vector('embedding', { dimensions: 256 }), // bge-m3 model produces 1024-dimensional embeddings
  model: text('model').notNull().default('@cf/baai/bge-m3'),
  textContent: text('text_content').notNull(), // Store the text that was embedded for reference
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  postIdIdx: index('post_embeddings_post_id_idx').on(table.postId),
  embeddingIdx: index('post_embeddings_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));

export type PostEmbedding = typeof postEmbeddings.$inferSelect;
export type PostEmbeddingInsert = typeof postEmbeddings.$inferInsert;
