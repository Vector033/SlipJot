import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["slipjot"],
  // Keep the migration log inside our schema too; the hosted project is shared with HarnKan.
  migrations: { schema: "slipjot", table: "__drizzle_migrations" },
  dbCredentials: { url: process.env.DATABASE_URL! },
});
