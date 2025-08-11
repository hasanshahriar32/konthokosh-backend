CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE "post_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"embedding" vector(1024),
	"model" text DEFAULT '@cf/baai/bge-m3' NOT NULL,
	"text_content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_embeddings" ADD CONSTRAINT "post_embeddings_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_embeddings_post_id_idx" ON "post_embeddings" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "post_embeddings_embedding_idx" ON "post_embeddings" USING hnsw ("embedding" vector_cosine_ops);
CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);