import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const quizResponsesTable = pgTable("quiz_responses", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull(),
  questionId: text("question_id").notNull(),
  selectedOption: text("selected_option").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  confidence: text("confidence").notNull(),
  responseTimeSeconds: integer("response_time_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
