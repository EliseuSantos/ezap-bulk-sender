import {
  pgTableCreator,
  uuid,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

const pgTable = pgTableCreator((name) => name);

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  clientName: text("client_name").notNull(),
  active: boolean("active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
