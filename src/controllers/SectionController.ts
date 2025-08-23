import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Get all sections (with or without classes)
export const getSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const sections = await prisma.section.findMany({
      include: { classes: true }, // remove if you only want sections
    });
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sections" });
  }
};

// ✅ Get a single section by id
export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const section = await prisma.section.findUnique({
      where: { id: Number(req.params.id) },
      include: { classes: true },
    });
    if (!section) {
      res.status(404).json({ error: "Section not found" });
      return;
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch section" });
  }
};

// ✅ Create a new section
export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const section = await prisma.section.create({
      data: { name },
    });
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ error: "Failed to create section" });
  }
};

// ✅ Update a section
export const updateSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const section = await prisma.section.update({
      where: { id: Number(req.params.id) },
      data: { name },
    });
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: "Failed to update section" });
  }
};

// ✅ Delete a section
export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.section.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete section" });
  }
};

// ✅ Get statistics for a section
export const getSectionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const sectionId = Number(req.params.id);

    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        classes: {
          include: {
            students: true,
            subjects: true,
            lessons: true,
            announcements: true,
          },
        },
      },
    });

    if (!section) {
      res.status(404).json({ error: "Section not found" });
      return;
    }

    const totalClasses = section.classes.length;
    const totalStudents = section.classes.reduce((sum, cls) => sum + cls.students.length, 0);
    const totalSubjects = section.classes.reduce((sum, cls) => sum + cls.subjects.length, 0);
    const totalLessons = section.classes.reduce((sum, cls) => sum + cls.lessons.length, 0);
    const totalAnnouncements = section.classes.reduce((sum, cls) => sum + cls.announcements.length, 0);

    res.json({
      section: section.name,
      totals: {
        totalClasses,
        totalStudents,
        totalSubjects,
        totalLessons,
        totalAnnouncements,
      },
      classes: section.classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        students: cls.students.length,
        subjects: cls.subjects.length,
        lessons: cls.lessons.length,
        announcements: cls.announcements.length,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch section stats" });
  }
};
