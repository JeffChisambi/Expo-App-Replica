import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { coursesTable, db, pool, questionsTable } from "./index";

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

  const dataPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../data/CEN1103_Elementary_Principles_of_Electricity_Question_Bank.csv",
  );
  const csv = await readFile(dataPath, "utf8");
  const rows = csv.trim().split(/\r?\n/);
  const headers = rows.shift()!.split(",");
  const parseRow = (line: string) => {
    const values: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"') {
        if (quoted && line[index + 1] === '"') {
          value += '"';
          index += 1;
        } else quoted = !quoted;
      } else if (character === "," && !quoted) {
        values.push(value);
        value = "";
      } else value += character;
    }
    values.push(value);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  };

  for (const line of rows) {
    const row = parseRow(line);
    await db
      .insert(questionsTable)
      .values({
        id: row.question_id,
        courseId: "elementary-principles-of-electricity",
        mainTopic: row.main_topic,
        subtopic: row.subtopic,
        learningObjective: row.learning_objective,
        questionType: row.question_type,
        questionText: row.question_text,
        options: [row.option_a, row.option_b, row.option_c, row.option_d],
        correctOption: row.correct_option,
        explanation: row.explanation,
        difficulty: row.difficulty,
        marks: Number(row.marks),
        estimatedTimeSeconds: Number(row.estimated_time_seconds),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: questionsTable.id,
        set: {
          questionText: row.question_text,
          options: [row.option_a, row.option_b, row.option_c, row.option_d],
          correctOption: row.correct_option,
          explanation: row.explanation,
          difficulty: row.difficulty,
          updatedAt: new Date(),
        },
      });
  }
  console.info(`Seeded ${courses.length} courses and ${rows.length} questions.`);
} finally {
  await pool.end();
}
