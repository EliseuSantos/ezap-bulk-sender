import {
  pgTableCreator,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

const pgTable = pgTableCreator((name) => name);

export const statusEnum = pgEnum("message_status", ["success", "error"]);

export const messageLog = pgTable(
  "message_log",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),

    src_number: varchar("src_number", { length: 20 }).notNull(),
    dest_number: varchar("dest_number", { length: 20 }).notNull(),

    status: statusEnum("status").notNull(),

    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      destNumberIdx: index("idx_message_log_dest_number").on(table.dest_number),
      statusIdx: index("idx_message_log_status").on(table.status),
      createdAtIdx: index("idx_message_log_created_at").on(table.created_at),
    };
  },
);
