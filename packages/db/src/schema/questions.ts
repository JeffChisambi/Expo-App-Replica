import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const questionsTable = pgTable("questions", {
  id: text("id").primaryKey(),
  courseId: text("course_id").notNull(),
  mainTopic: text("main_topic").notNull(),
  subtopic: text("subtopic").notNull(),
  learningObjective: text("learning_objective").notNull(),
  questionType: text("question_type").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctOption: text("correct_option").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty").notNull(),
  marks: integer("marks").notNull(),
  estimatedTimeSeconds: integer("estimated_time_seconds").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Question = typeof questionsTable.$inferSelect;
