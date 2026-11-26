import { db, coursesTable, questionsTable } from "@stem-smartstudy/db";
import { asc, count, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/courses", async (_req, res) => {
  const courses = await db
    .select({
      id: coursesTable.id,
      name: coursesTable.name,
      isAvailable: coursesTable.isAvailable,
    })
    .from(coursesTable)
    .orderBy(asc(coursesTable.name));

  res.json({ courses });
});

router.get("/courses/:courseId/topics", async (req, res) => {
  const rows = await db
    .select({
      topic: questionsTable.mainTopic,
      subtopic: questionsTable.subtopic,
      questionCount: count(questionsTable.id),
    })
    .from(questionsTable)
    .where(eq(questionsTable.courseId, req.params.courseId))
    .groupBy(questionsTable.mainTopic, questionsTable.subtopic)
    .orderBy(asc(questionsTable.mainTopic), asc(questionsTable.subtopic));

  const topics = new Map<string, { topic: string; questionCount: number; subtopics: string[] }>();
  for (const row of rows) {
    const current = topics.get(row.topic) ?? { topic: row.topic, questionCount: 0, subtopics: [] };
    current.questionCount += Number(row.questionCount);
    current.subtopics.push(row.subtopic);
    topics.set(row.topic, current);
  }

  res.json({ topics: [...topics.values()] });
});

export default router;
