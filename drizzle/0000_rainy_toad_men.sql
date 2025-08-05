CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "modules_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sub_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer,
	"name" varchar(64) NOT NULL,
	"description" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "actions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"action_id" integer,
	"module_id" integer,
	"sub_module_id" integer,
	"name" varchar(128) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_action_id_module_id_sub_module_id_unique" UNIQUE("action_id","module_id","sub_module_id")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer,
	"permission_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "role_permissions_role_id_permission_id_unique" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_roles_user_id_role_id_unique" UNIQUE("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(64),
	"last_name" varchar(64),
	"username" varchar(64),
	"image_url" text,
	"profile_image_url" text,
	"has_image" boolean DEFAULT false,
	"emails" jsonb DEFAULT '[]'::jsonb,
	"phone_numbers" jsonb DEFAULT '[]'::jsonb,
	"web3_wallets" jsonb DEFAULT '[]'::jsonb,
	"external_accounts" jsonb DEFAULT '[]'::jsonb,
	"primary_email_address_id" varchar(128),
	"primary_phone_number_id" varchar(128),
	"primary_web3_wallet_id" varchar(128),
	"password_enabled" boolean DEFAULT false,
	"two_factor_enabled" boolean DEFAULT false,
	"mfa_enabled_at" timestamp,
	"mfa_disabled_at" timestamp,
	"banned" boolean DEFAULT false,
	"locked" boolean DEFAULT false,
	"lockout_expires_in_seconds" integer,
	"verification_attempts_remaining" integer DEFAULT 100,
	"last_sign_in_at" timestamp,
	"last_active_at" timestamp,
	"legal_accepted_at" timestamp,
	"public_metadata" jsonb DEFAULT '{}'::jsonb,
	"private_metadata" jsonb DEFAULT '{}'::jsonb,
	"unsafe_metadata" jsonb DEFAULT '{}'::jsonb,
	"external_id" varchar(128),
	"delete_self_enabled" boolean DEFAULT true,
	"create_organization_enabled" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"clerk_uid" varchar(128) NOT NULL,
	CONSTRAINT "users_clerk_uid_unique" UNIQUE("clerk_uid")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"price" integer NOT NULL,
	"category_id" integer,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pdf_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_id" integer NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"chunk_index" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"chat_id" integer NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"fileUrl" varchar(2083) NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL,
	"page_count" integer,
	CONSTRAINT "file_uploads_fileUrl_unique" UNIQUE("fileUrl")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"search_id" varchar(255),
	"pdf_list" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embedding_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" varchar(255) NOT NULL,
	"search_id" integer NOT NULL,
	"total_papers" integer NOT NULL,
	"uploaded_count" integer NOT NULL,
	"papers" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sub_modules" ADD CONSTRAINT "sub_modules_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_sub_module_id_sub_modules_id_fk" FOREIGN KEY ("sub_module_id") REFERENCES "public"."sub_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdf_embeddings" ADD CONSTRAINT "pdf_embeddings_file_id_file_uploads_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file_uploads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedding_tasks" ADD CONSTRAINT "embedding_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embedding_tasks" ADD CONSTRAINT "embedding_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX IF NOT EXISTS pdf_embeddings_embedding_idx ON pdf_embeddings USING hnsw (embedding vector_cosine_ops);