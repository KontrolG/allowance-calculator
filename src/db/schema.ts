import {
  boolean,
  date,
  numeric,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

export const AllowancesTable = pgTable("allowances", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  date: date("date").notNull(),
  amount: numeric("amount").notNull(),
  diff: numeric("diff").notNull(),
  isCalculated: boolean("isCalculated").default(false),
});

export type SelectAllowances = typeof AllowancesTable.$inferSelect;
export type InsertAllowances = typeof AllowancesTable.$inferInsert;
