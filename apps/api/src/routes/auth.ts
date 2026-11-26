import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, sessionsTable, studentsTable } from "@stem-smartstudy/db";
import { requireStudent } from "../middlewares/requireStudent";

const router: IRouter = Router();
const studentEmailPattern = /^cen-\d{2}-\d{2}-(\d{2})@unilia\.ac\.mw$/;
const isStudentEmail = (email: string) => {
  const match = studentEmailPattern.exec(email.trim().toLowerCase());
  const currentAcademicYear = new Date().getFullYear() % 100;
  return Boolean(match) && Number(match[1]) <= currentAcademicYear;
};
const hashPassword = (password: string) => { const salt = randomBytes(16).toString("hex"); return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`; };
const matchesPassword = (password: string, stored: string) => { const [salt, hash] = stored.split(":"); return timingSafeEqual(Buffer.from(hash, "hex"), scryptSync(password, salt, 64)); };
const createSession = async (studentId: string) => { const token = randomBytes(32).toString("hex"); await db.insert(sessionsTable).values({ token, studentId, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) }); return token; };

router.post("/auth/register", async (req, res) => {
  const { email, password, displayName } = req.body as { email?: string; password?: string; displayName?: string };
  if (!email || !password || password.length < 8 || !displayName) { res.status(400).json({ message: "Name, email, and a password of at least 8 characters are required." }); return; }
  const normalizedEmail = email.trim().toLowerCase();
  if (!isStudentEmail(normalizedEmail)) { res.status(400).json({ message: "Use your university email in the format cen-01-28-22@unilia.ac.mw." }); return; }
  const [existing] = await db.select().from(studentsTable).where(eq(studentsTable.email, normalizedEmail));
  if (existing) { res.status(409).json({ message: "An account already exists for this email." }); return; }
  const id = randomBytes(16).toString("hex");
  await db.insert(studentsTable).values({ id, email: normalizedEmail, displayName: displayName.trim(), passwordHash: hashPassword(password) });
  const token = await createSession(id);
  res.status(201).json({ token, student: { id, email: normalizedEmail, displayName: displayName.trim() } });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !isStudentEmail(email)) { res.status(400).json({ message: "Use your university email in the format cen-01-28-22@unilia.ac.mw." }); return; }
  const [student] = email ? await db.select().from(studentsTable).where(eq(studentsTable.email, email.trim().toLowerCase())) : [];
  if (!student || !password || !matchesPassword(password, student.passwordHash)) { res.status(401).json({ message: "Email or password is incorrect." }); return; }
  const token = await createSession(student.id);
  res.json({ token, student: { id: student.id, email: student.email, displayName: student.displayName } });
});

router.get("/auth/me", requireStudent, async (req, res) => {
  const [student] = await db.select({ id: studentsTable.id, email: studentsTable.email, displayName: studentsTable.displayName }).from(studentsTable).where(eq(studentsTable.id, req.studentId!));
  res.json({ student });
});

export default router;
