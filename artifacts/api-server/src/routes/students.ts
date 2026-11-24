import { getAuth } from "@clerk/express";
import { db, studentsTable } from "@workspace/db";
import { Router, type IRouter } from "express";
import { requireStudent } from "../middlewares/requireStudent";

const router: IRouter = Router();

router.get("/students/me", requireStudent, async (req, res) => {
  const clerkUserId = getAuth(req).userId;
  if (!clerkUserId) {
    res.status(401).json({ message: "Sign in to access student resources." });
    return;
  }

  const now = new Date();
  const [student] = await db
    .insert(studentsTable)
    .values({ clerkUserId, lastSeenAt: now })
    .onConflictDoUpdate({
      target: studentsTable.clerkUserId,
      set: { lastSeenAt: now },
    })
    .returning();

  res.json({
    studentId: student.clerkUserId,
    role: "student",
    createdAt: student.createdAt.toISOString(),
    lastSeenAt: student.lastSeenAt.toISOString(),
  });
});

export default router;
