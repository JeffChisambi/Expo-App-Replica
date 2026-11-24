import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const coursesTable = pgTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  isAvailable: boolean("is_available").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Course = typeof coursesTable.$inferSelect;
