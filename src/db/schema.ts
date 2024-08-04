import {
  boolean,
  date,
  numeric,
  pgTable,
  serial,
  text,
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

export const ConfigsTable = pgTable("configs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export type SelectConfigs = typeof ConfigsTable.$inferSelect;
export type InsertConfigs = typeof ConfigsTable.$inferInsert;
