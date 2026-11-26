import { asc, count, eq, inArray, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, questionsTable, quizResponsesTable } from "@stem-smartstudy/db";
import { requireStudent } from "../middlewares/requireStudent";

const router: IRouter = Router();

const PRIOR_ALPHA = 2;
const PRIOR_BETA = 2;
const ESTABLISHED_ATTEMPTS = 30;
const ESTABLISHED_STUDENTS = 10;
const MINIMUM_ATTEMPTS = 10;
const MINIMUM_STUDENTS = 5;

/**
 * Returns a conservative, interpretable school-wide topic estimate.
 *
 * A Beta(2, 2) prior smooths sparse results towards 50% so a topic with one
 * incorrect answer is not incorrectly presented as the course's hardest topic.
 * The interval is a normal approximation of the posterior credible interval.
 */
function estimateTopicDifficulty(correct: number, attempts: number, students: number) {
  const alpha = PRIOR_ALPHA + correct;
  const beta = PRIOR_BETA + attempts - correct;
  const posteriorAccuracy = alpha / (alpha + beta);
  const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
  const margin = 1.96 * Math.sqrt(variance);
  const accuracyLowerBound = Math.max(0, posteriorAccuracy - margin);
  const accuracyUpperBound = Math.min(1, posteriorAccuracy + margin);
  const evidence = Math.min(1, attempts / ESTABLISHED_ATTEMPTS, students / ESTABLISHED_STUDENTS);
  const evidenceLevel = attempts >= ESTABLISHED_ATTEMPTS && students >= ESTABLISHED_STUDENTS
    ? "established"
    : attempts >= MINIMUM_ATTEMPTS && students >= MINIMUM_STUDENTS
      ? "preliminary"
      : "insufficient";

  return {
    posteriorAccuracy,
    accuracyLowerBound,
    accuracyUpperBound,
    // Conservative difficulty: a topic only ranks highly when even its upper
    // plausible accuracy remains low.
    difficultyScore: 1 - accuracyUpperBound,
    recommendationScore: (1 - accuracyUpperBound) * evidence,
    evidenceLevel,
    isRecommended: evidenceLevel !== "insufficient",
  };
}

router.post("/learning/responses", requireStudent, async (req, res) => {
  const { responses } = req.body as {
    responses?: Array<{ questionId: string; selectedOption: string; confidence: string; responseTimeSeconds?: number }>;
  };
  if (!Array.isArray(responses) || responses.length === 0) {
    res.status(400).json({ message: "At least one response is required." });
    return;
  }
  const questionIds = responses.map((response) => response.questionId);
  const questions = await db.select().from(questionsTable).where(inArray(questionsTable.id, questionIds));
  const answerById = new Map(questions.map((question) => [question.id, question.correctOption]));
  await db.insert(quizResponsesTable).values(
    responses.filter((response) => answerById.has(response.questionId)).map((response) => ({
      studentId: req.studentId!,
      questionId: response.questionId,
      selectedOption: response.selectedOption,
      isCorrect: answerById.get(response.questionId) === response.selectedOption,
      confidence: response.confidence,
      responseTimeSeconds: response.responseTimeSeconds,
    })),
  );
  res.status(201).json({ recorded: responses.length });
});

router.get("/learning/topic-difficulty", async (req, res) => {
  const courseId = typeof req.query.courseId === "string" ? req.query.courseId : undefined;
  const topics = await db
    .select({
      topic: questionsTable.mainTopic,
      attempts: count(quizResponsesTable.id),
      accuracy: sql<number>`coalesce(avg(case when ${quizResponsesTable.isCorrect} then 1.0 else 0.0 end), 0)`,
      correctAnswers: sql<number>`coalesce(sum(case when ${quizResponsesTable.isCorrect} then 1 else 0 end), 0)`,
      students: sql<number>`count(distinct ${quizResponsesTable.studentId})`,
    })
    .from(questionsTable)
    .leftJoin(quizResponsesTable, eq(quizResponsesTable.questionId, questionsTable.id))
    .where(courseId ? eq(questionsTable.courseId, courseId) : undefined)
    .groupBy(questionsTable.mainTopic)
    .orderBy(asc(questionsTable.mainTopic));

  const rankedTopics = topics
    .map((topic) => {
      const attempts = Number(topic.attempts);
      const correctAnswers = Number(topic.correctAnswers);
      const students = Number(topic.students);
      return {
        topic: topic.topic,
        attempts,
        correctAnswers,
        students,
        accuracy: Number(topic.accuracy),
        ...estimateTopicDifficulty(correctAnswers, attempts, students),
      };
    })
    .sort((left, right) => right.recommendationScore - left.recommendationScore);

  res.json({ topics: rankedTopics });
});

export default router;
