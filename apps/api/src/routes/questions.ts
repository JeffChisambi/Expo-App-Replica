import { and, asc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, questionsTable } from "@stem-smartstudy/db";

const router: IRouter = Router();

router.get("/courses/:courseId/questions", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 50);
  const questions = await db
    .select({
      id: questionsTable.id,
      mainTopic: questionsTable.mainTopic,
      subtopic: questionsTable.subtopic,
      questionText: questionsTable.questionText,
      options: questionsTable.options,
      correctOption: questionsTable.correctOption,
      explanation: questionsTable.explanation,
      difficulty: questionsTable.difficulty,
      marks: questionsTable.marks,
      estimatedTimeSeconds: questionsTable.estimatedTimeSeconds,
    })
    .from(questionsTable)
    .where(eq(questionsTable.courseId, req.params.courseId))
    .orderBy(sql`random()`)
    .limit(limit);

  res.json({ questions });
});

export default router;
