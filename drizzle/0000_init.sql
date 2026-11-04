CREATE SCHEMA IF NOT EXISTS "slipjot";
--> statement-breakpoint
CREATE TABLE "slipjot"."ai_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"cost_usd" numeric(12, 6) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slipjot"."ai_usage" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "slipjot"."categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text,
	"name" text NOT NULL,
	"icon" text DEFAULT '📦' NOT NULL,
	"color" text DEFAULT '#94a3b8' NOT NULL,
	"monthly_budget" numeric(12, 2),
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slipjot"."categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "slipjot"."expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"payee_name" text DEFAULT '' NOT NULL,
	"payee_key" text DEFAULT '' NOT NULL,
	"payee_bank" text,
	"payee_last4" text,
	"sender_bank" text,
	"sender_last4" text,
	"memo" text,
	"reference" text,
	"category_id" uuid,
	"category_source" text DEFAULT 'none' NOT NULL,
	"auto_category_source" text DEFAULT 'none' NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"read_source" text DEFAULT 'manual' NOT NULL,
	"confidence" real,
	"issues" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image_sha256" text,
	"image_dhash" text,
	"qr_payload" text,
	"duplicate_of" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slipjot"."expenses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "slipjot"."payee_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payee_key" text NOT NULL,
	"category_id" uuid NOT NULL,
	"source" text NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slipjot"."payee_rules" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "slipjot"."settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"keep_images" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slipjot"."settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "slipjot"."slip_images" (
	"expense_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"mime_type" text NOT NULL,
	"bytes" "bytea" NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() + interval '7 days',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "slipjot"."slip_images" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "slipjot"."ai_usage" ADD CONSTRAINT "ai_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."expenses" ADD CONSTRAINT "expenses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "slipjot"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."payee_rules" ADD CONSTRAINT "payee_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."payee_rules" ADD CONSTRAINT "payee_rules_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "slipjot"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."slip_images" ADD CONSTRAINT "slip_images_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "slipjot"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slipjot"."slip_images" ADD CONSTRAINT "slip_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_usage_user_idx" ON "slipjot"."ai_usage" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_name_idx" ON "slipjot"."categories" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "categories_user_idx" ON "slipjot"."categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expenses_user_time_idx" ON "slipjot"."expenses" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "expenses_user_sha_idx" ON "slipjot"."expenses" USING btree ("user_id","image_sha256");--> statement-breakpoint
CREATE INDEX "expenses_user_ref_idx" ON "slipjot"."expenses" USING btree ("user_id","reference");--> statement-breakpoint
CREATE INDEX "expenses_user_amount_idx" ON "slipjot"."expenses" USING btree ("user_id","amount");--> statement-breakpoint
CREATE UNIQUE INDEX "payee_rules_user_key_idx" ON "slipjot"."payee_rules" USING btree ("user_id","payee_key");--> statement-breakpoint
CREATE INDEX "slip_images_expiry_idx" ON "slipjot"."slip_images" USING btree ("expires_at");