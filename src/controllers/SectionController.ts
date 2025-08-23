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
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch sections", details: error.message });
  }
};

// ✅ Get a single section by id
export const getSectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid section id" });
      return;
    }

    const section = await prisma.section.findUnique({
      where: { id },
      include: { classes: true },
    });

    if (!section) {
      res.status(404).json({ error: "Section not found" });
      return;
    }
    res.json(section);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch section", details: error.message });
  }
};

// ✅ Create a new section
export const createSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: "Section name is required" });
      return;
    }

    const section = await prisma.section.create({
      data: { name },
    });
    res.status(201).json(section);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create section", details: error.message });
  }
};

// ✅ Update a section
export const updateSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid section id" });
      return;
    }

    const { name } = req.body;
    const section = await prisma.section.update({
      where: { id },
      data: { name },
    });
    res.json(section);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update section", details: error.message });
  }
};

// ✅ Delete a section
export const deleteSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid section id" });
      return;
    }

    await prisma.section.delete({
      where: { id },
    });
    res.json({ message: "Section deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete section", details: error.message });
  }
};

// ✅ Get statistics for a section
export const getSectionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const sectionId = parseInt(req.params.id, 10);
    if (isNaN(sectionId)) {
      res.status(400).json({ error: "Invalid section id" });
      return;
    }

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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch section stats", details: error.message });
  }
};
