CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"post" text NOT NULL,
	"user_id" integer NOT NULL,
	"is_approved" boolean DEFAULT false,
	"images_id" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);