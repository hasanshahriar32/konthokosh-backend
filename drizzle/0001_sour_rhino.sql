CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "file_uploads" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "file_uploads" ALTER COLUMN "chat_id" SET DATA TYPE integer;
CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);