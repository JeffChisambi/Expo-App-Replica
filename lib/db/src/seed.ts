import { coursesTable, db, pool } from "./index";

const courses = [
  {
    id: "elementary-principles-of-electricity",
    name: "Elementary Principles of Electricity",
    isAvailable: true,
  },
  { id: "programming", name: "Programming", isAvailable: false },
  { id: "operating-systems", name: "Operating Systems", isAvailable: false },
];

try {
  for (const course of courses) {
    await db
      .insert(coursesTable)
      .values(course)
      .onConflictDoUpdate({
        target: coursesTable.id,
        set: {
          name: course.name,
          isAvailable: course.isAvailable,
          updatedAt: new Date(),
        },
      });
  }
  console.info(`Seeded ${courses.length} course records.`);
} finally {
  await pool.end();
}
