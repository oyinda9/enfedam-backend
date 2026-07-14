import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Standard ENFEDAM Academy curriculum. Keys must match real Section.name values
// exactly so subjects connect to that section's existing classes automatically.
export const CURRICULUM: Record<string, string[]> = {
  Creche: [
    "Language Development",
    "Numeracy",
    "Social Development",
    "Creative Arts",
    "Physical Development",
    "Health Habits",
    "Play Activities",
  ],
  Nursery: [
    "English Language",
    "Mathematics",
    "Phonics",
    "Rhymes",
    "Basic Science",
    "Social Studies",
    "Creative Arts",
    "Health Education",
    "Handwriting",
    "ICT",
    "Physical Education",
    "CRS/IRS",
  ],
  Primary: [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "ICT",
    "Physical & Health Education",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Home Economics",
    "Agricultural Science",
    "Cultural & Creative Arts",
    "CRS/IRS",
    "French",
    "Nigerian Language",
    "Verbal Reasoning",
    "Quantitative Reasoning",
  ],
  "Junior Secondary": [
    "English Studies",
    "Mathematics",
    "Basic Science",
    "Basic Technology",
    "Computer Studies",
    "Business Studies",
    "Social Studies",
    "Civic Education",
    "Security Education",
    "Home Economics",
    "Agricultural Science",
    "Cultural & Creative Arts",
    "Physical & Health Education",
    "History",
    "French",
    "Nigerian Language",
    "CRS/IRS",
  ],
  "Senior Secondary": [
    // Compulsory
    "English Language",
    "Mathematics",
    "Civic Education",
    "Data Processing",
    // Science
    "Physics",
    "Chemistry",
    "Biology",
    "Further Mathematics",
    "Agricultural Science",
    "Technical Drawing",
    "Computer Science",
    // Commercial
    "Financial Accounting",
    "Commerce",
    "Economics",
    "Government",
    "Office Practice",
    "Marketing",
    // Arts
    "Literature in English",
    "History",
    "CRS/IRS",
    "Fine Arts",
    "Music",
    "French",
    "Nigerian Language",
  ],
};

async function main() {
  const sections = await prisma.section.findMany({ include: { classes: { select: { id: true } } } });
  const sectionByName = new Map(sections.map((s) => [s.name, s]));

  const existingSubjects = await prisma.subject.findMany({ select: { id: true, name: true } });
  const existingByLowerName = new Set(existingSubjects.map((s) => s.name.trim().toLowerCase()));

  const subjectClassIds = new Map<string, Set<number>>();
  for (const [sectionName, subjects] of Object.entries(CURRICULUM)) {
    const section = sectionByName.get(sectionName);
    if (!section) {
      console.warn(`No Section named "${sectionName}" found - subjects unique to it will be created unconnected.`);
    }
    const classIds = section ? section.classes.map((c) => c.id) : [];
    for (const subjectName of subjects) {
      const set = subjectClassIds.get(subjectName) ?? new Set<number>();
      classIds.forEach((id) => set.add(id));
      subjectClassIds.set(subjectName, set);
    }
  }

  const created: string[] = [];
  const skipped: string[] = [];

  for (const [name, classIdSet] of subjectClassIds) {
    if (existingByLowerName.has(name.trim().toLowerCase())) {
      skipped.push(name);
      continue;
    }
    await prisma.subject.create({
      data: {
        name,
        classes: { connect: Array.from(classIdSet).map((id) => ({ id })) },
      },
    });
    created.push(name);
  }

  console.log(`Created ${created.length} subjects:`, created);
  console.log(`Skipped ${skipped.length} (name already existed):`, skipped);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
