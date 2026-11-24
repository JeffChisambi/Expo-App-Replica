import { asc, count, eq, inArray, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, questionsTable, quizResponsesTable } from "@stem-smartstudy/db";

const router: IRouter = Router();

router.post("/learning/responses", async (req, res) => {
  const { deviceId, responses } = req.body as {
    deviceId?: string;
    responses?: Array<{ questionId: string; selectedOption: string; confidence: string; responseTimeSeconds?: number }>;
  };
  if (!deviceId || !Array.isArray(responses) || responses.length === 0) {
    res.status(400).json({ message: "deviceId and at least one response are required." });
    return;
  }
  const questionIds = responses.map((response) => response.questionId);
  const questions = await db.select().from(questionsTable).where(inArray(questionsTable.id, questionIds));
  const answerById = new Map(questions.map((question) => [question.id, question.correctOption]));
  await db.insert(quizResponsesTable).values(
    responses.filter((response) => answerById.has(response.questionId)).map((response) => ({
      deviceId,
      questionId: response.questionId,
      selectedOption: response.selectedOption,
      isCorrect: answerById.get(response.questionId) === response.selectedOption,
      confidence: response.confidence,
      responseTimeSeconds: response.responseTimeSeconds,
    })),
  );
  res.status(201).json({ recorded: responses.length });
});

router.get("/learning/topic-difficulty", async (_req, res) => {
  const topics = await db
    .select({
      topic: questionsTable.mainTopic,
      attempts: count(quizResponsesTable.id),
      accuracy: sql<number>`coalesce(avg(case when ${quizResponsesTable.isCorrect} then 1.0 else 0.0 end), 0)`,
    })
    .from(questionsTable)
    .leftJoin(quizResponsesTable, eq(quizResponsesTable.questionId, questionsTable.id))
    .groupBy(questionsTable.mainTopic)
    .orderBy(asc(sql`coalesce(avg(case when ${quizResponsesTable.isCorrect} then 1.0 else 0.0 end), 0)`));
  res.json({ topics: topics.map((topic) => ({ ...topic, accuracy: Number(topic.accuracy) })) });
});

export default router;
