import { PrismaClient } from "@prisma/client";
import { CURRICULUM } from "./seedCurriculum";

const prisma = new PrismaClient();

const DEFAULT_CAPACITY = 30;

// Standard class levels per section. No arm letter (A/B/C) - add those later
// via PUT /class/classes/:id (or split into more classes) once you know real
// enrollment numbers per level.
const CLASS_LEVELS: Record<string, string[]> = {
  Creche: ["Creche"],
  Nursery: ["Nursery 1", "Nursery 2", "Nursery 3"],
  Primary: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5"],
  "Junior Secondary": ["JSS 1", "JSS 2", "JSS 3"],
  "Senior Secondary": ["SSS 1", "SSS 2", "SSS 3"],
};

async function main() {
  const createdClasses: string[] = [];
  const skippedClasses: string[] = [];

  for (const [sectionName, levels] of Object.entries(CLASS_LEVELS)) {
    let section = await prisma.section.findUnique({ where: { name: sectionName } });
    if (!section) {
      section = await prisma.section.create({ data: { name: sectionName } });
      console.log(`Created missing section: ${sectionName}`);
    }

    for (const className of levels) {
      const existing = await prisma.class.findUnique({ where: { name: className } });
      if (existing) {
        skippedClasses.push(className);
        continue;
      }

      // Connect to every curriculum subject for this section, so the class
      // shows up correctly in subject dropdowns immediately. Matched
      // case-insensitively since real subject rows don't always match the
      // curriculum's exact casing (e.g. "mathematics" vs "Mathematics").
      const subjectNames = new Set((CURRICULUM[sectionName] ?? []).map((n) => n.toLowerCase()));
      const allSubjects = await prisma.subject.findMany({ select: { id: true, name: true } });
      const subjects = allSubjects.filter((s) => subjectNames.has(s.name.toLowerCase()));

      await prisma.class.create({
        data: {
          name: className,
          capacity: DEFAULT_CAPACITY,
          sectionId: section.id,
          subjects: { connect: subjects.map((s) => ({ id: s.id })) },
        },
      });
      createdClasses.push(className);
    }
  }

  console.log(`Created ${createdClasses.length} classes:`, createdClasses);
  console.log(`Skipped ${skippedClasses.length} (name already existed):`, skippedClasses);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
