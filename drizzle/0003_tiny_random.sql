CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"search_id" varchar(255),
	"pdf_list" jsonb NOT NULL
);

CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);