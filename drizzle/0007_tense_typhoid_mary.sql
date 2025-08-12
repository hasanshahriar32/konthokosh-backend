CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "post_embeddings" ALTER COLUMN "embedding" SET DATA TYPE vector(1024);
CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);