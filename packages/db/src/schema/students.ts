import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const studentsTable = pgTable("students", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Student = typeof studentsTable.$inferSelect;
