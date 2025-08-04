CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "users" ADD COLUMN "clerk_uid" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_uid_unique" UNIQUE("clerk_uid");
CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);