import { db, coursesTable } from "@stem-smartstudy/db";
import { asc } from "drizzle-orm";
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

export default router;
