import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./client.js";
import { logger } from "../config/logger.js";

export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    logger.debug("Migrations ran successfully");
  } catch (err) {
    logger.error("Migration failed:", err);
    process.exit(1);
  }
}
