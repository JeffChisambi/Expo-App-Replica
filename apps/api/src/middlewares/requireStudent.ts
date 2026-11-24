import { and, eq, gt } from "drizzle-orm";
import type { RequestHandler } from "express";
import { db, sessionsTable } from "@stem-smartstudy/db";

declare global {
  namespace Express { interface Request { studentId?: string } }
}

export const requireStudent: RequestHandler = async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) { res.status(401).json({ message: "Sign in required." }); return; }
  const [session] = await db.select().from(sessionsTable).where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date())));
  if (!session) { res.status(401).json({ message: "Session expired. Please sign in again." }); return; }
  req.studentId = session.studentId;
  next();
};
