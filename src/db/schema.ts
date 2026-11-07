import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  numeric,
  pgSchema,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authUsers } from "drizzle-orm/supabase";

// SlipJot's tables live in their own Postgres schema, so the app can share a hosted
// Supabase project (and its auth.users) with HarnKan without touching HarnKan's tables.
export const slipjot = pgSchema("slipjot");

// Every table hangs off auth.users with ON DELETE CASCADE, so deleting the account
// deletes all of the user's data. RLS is on with no policies: the app reads through the
// server-side DATABASE_URL connection and filters by user id itself (src/lib/data.ts),
// and the public Supabase API key cannot read these tables at all.

const owner = () =>
  uuid("user_id")
    .notNull()
    .references(() => authUsers.id, { onDelete: "cascade" });

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Baht with satang, read back as a JS number. */
const money = (name: string) => numeric(name, { precision: 12, scale: 2, mode: "number" });

const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

export const settings = slipjot.table("settings", {
  userId: owner().primaryKey(),
  /** Off by default (PDPA): slip images are deleted as soon as the expense is confirmed. */
  keepImages: boolean("keep_images").notNull().default(false),
  ...timestamps,
}).enableRLS();

export const categories = slipjot.table(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: owner(),
    /** Built-in categories have a slug the keyword rules and the LLM refer to. */
    slug: text("slug"),
    name: text("name").notNull(),
    icon: text("icon").notNull().default("other"),
    color: text("color").notNull().default("#94a3b8"),
    monthlyBudget: money("monthly_budget"),
    sort: integer("sort").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("categories_user_name_idx").on(t.userId, t.name), index("categories_user_idx").on(t.userId)],
).enableRLS();

export type CategorySource = "rule" | "keyword" | "llm" | "user" | "none";
export type ExpenseStatus = "review" | "confirmed";
export type ReadSource = "gemini" | "ocr" | "fake" | "manual";

export const expenses = slipjot.table(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: owner(),
    amount: money("amount").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    payeeName: text("payee_name").notNull().default(""),
    /** normalizeThaiName(payee) without spaces: the key categorisation rules learn on. */
    payeeKey: text("payee_key").notNull().default(""),
    payeeBank: text("payee_bank"),
    payeeLast4: text("payee_last4"),
    senderBank: text("sender_bank"),
    senderLast4: text("sender_last4"),
    memo: text("memo"),
    reference: text("reference"),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    categorySource: text("category_source").$type<CategorySource>().notNull().default("none"),
    /** How the category was first chosen, kept after user edits to measure the rule/LLM split. */
    autoCategorySource: text("auto_category_source").$type<CategorySource>().notNull().default("none"),
    status: text("status").$type<ExpenseStatus>().notNull().default("confirmed"),
    readSource: text("read_source").$type<ReadSource>().notNull().default("manual"),
    confidence: real("confidence"),
    issues: jsonb("issues").$type<string[]>().notNull().default([]),
    /** Hashes for duplicate detection. Not reversible to the image. */
    imageSha256: text("image_sha256"),
    imageDhash: text("image_dhash"),
    qrPayload: text("qr_payload"),
    duplicateOf: uuid("duplicate_of"),
    ...timestamps,
  },
  (t) => [
    index("expenses_user_time_idx").on(t.userId, t.occurredAt),
    index("expenses_user_sha_idx").on(t.userId, t.imageSha256),
    index("expenses_user_ref_idx").on(t.userId, t.reference),
    index("expenses_user_amount_idx").on(t.userId, t.amount),
  ],
).enableRLS();

/** Slip images kept for review (expire after 7 days) or because the user opted in. */
export const slipImages = slipjot.table(
  "slip_images",
  {
    expenseId: uuid("expense_id")
      .primaryKey()
      .references(() => expenses.id, { onDelete: "cascade" }),
    userId: owner(),
    mimeType: text("mime_type").notNull(),
    bytes: bytea("bytes").notNull(),
    /** null = kept until the user deletes it (keepImages on). */
    expiresAt: timestamp("expires_at", { withTimezone: true }).default(sql`now() + interval '7 days'`),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("slip_images_expiry_idx").on(t.expiresAt)],
).enableRLS();

/** Learned "this payee goes in that category" rules, from user edits or a previous LLM answer. */
export const payeeRules = slipjot.table(
  "payee_rules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: owner(),
    payeeKey: text("payee_key").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    source: text("source").$type<"user" | "llm">().notNull(),
    hits: integer("hits").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("payee_rules_user_key_idx").on(t.userId, t.payeeKey)],
).enableRLS();

/** One row per paid model call, for the cost-per-slip numbers. */
export const aiUsage = slipjot.table(
  "ai_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: owner(),
    kind: text("kind").$type<"read" | "categorize">().notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    costUsd: numeric("cost_usd", { precision: 12, scale: 6, mode: "number" }).notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_usage_user_idx").on(t.userId, t.createdAt)],
).enableRLS();

/**
 * Fixed-window counters for rate limiting, shared by every serverless instance.
 * Keys never hold raw IPs or emails: they are HMAC-hashed first (src/lib/rate-limit.ts).
 */
export const rateLimits = slipjot.table(
  "rate_limits",
  {
    key: text("key").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.key, t.windowStart] }), index("rate_limits_window_idx").on(t.windowStart)],
).enableRLS();
