import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

// Reuse one pool across hot reloads in dev. In production DATABASE_URL must be Supabase's
// *session* pooler (:5432): pages run several queries at once, postgres.js pipelines them
// when they outnumber the connections, and pipelined queries hang on the transaction
// pooler (:6543). A short idle timeout hands session connections back between requests.
const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: Number(process.env.DB_POOL_MAX ?? 5),
    idle_timeout: 20,
  });
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema });

/** Raw client, for the few queries Drizzle has no schema for (auth.sessions). */
export { sql };
