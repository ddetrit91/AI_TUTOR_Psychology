import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { config as loadDotenv } from "dotenv";

// Load .env.local or .env
const rootDir = process.cwd();
const envLocalPath = path.join(rootDir, ".env.local");
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envLocalPath)) {
  loadDotenv({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  loadDotenv({ path: envPath });
}

// Per Neon best practices: use direct (unpooled) connection for schema migrations
const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL_UNPOOLED / DATABASE_URL");
  process.exit(1);
}

const sql = neon(connectionString);
const schemaSql = fs.readFileSync(path.join(rootDir, "src/db/schema.sql"), "utf8");

// Split statements cleanly on semicolon followed by newline
const statements = schemaSql
  .split(/;\s*\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);

async function runMigration() {
  console.log("Running schema migration against Lakebase Postgres (unpooled)...");
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`Applied ${statements.length} DDL statements successfully.`);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
