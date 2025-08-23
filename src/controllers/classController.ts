import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ClassController {
  // ✅ Create a new class
  static async createClass(req: Request, res: Response): Promise<void> {
    try {
      const { name, capacity, supervisorId, sectionId } = req.body;

      if (!name || !capacity) {
        res.status(400).json({ error: "Name and capacity are required" });
        return;
      }

      // ✅ Validate Section
      if (sectionId) {
        const sectionExists = await prisma.section.findUnique({
          where: { id: sectionId },
        });
        if (!sectionExists) {
          res.status(400).json({ error: "Section not found" });
          return;
        }
      }

      // ✅ Validate Supervisor
      if (supervisorId) {
        const supervisorExists = await prisma.teacher.findUnique({
          where: { id: supervisorId },
        });
        if (!supervisorExists) {
          res.status(400).json({ error: "Supervisor not found" });
          return;
        }
      }

      const newClass = await prisma.class.create({
        data: {
          name,
          capacity,
          supervisorId, // ✅ directly set FK
          sectionId,    // ✅ directly set FK
        },
        include: {
          section: true,
          supervisor: true,
        },
      });

      res.status(201).json({ message: "Class created successfully", newClass });
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({
        error: "Error creating class",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // ✅ Get all classes
  static async getAllClasses(req: Request, res: Response): Promise<void> {
    try {
      const classes = await prisma.class.findMany({
        include: {
          section: true,
          supervisor: true,
          students: true,
          announcements: true,
          lessons: true,
          subjects: true,
        },
      });
      res.status(200).json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({
        error: "Error fetching classes",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // ✅ Get a single class by ID
  static async getClassById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classData = await prisma.class.findUnique({
        where: { id: parseInt(id) },
        include: {
          section: true,
          supervisor: true,
          students: true,
          announcements: true,
          lessons: true,
          subjects: true,
        },
      });

      if (!classData) {
        res.status(404).json({ error: "Class not found" });
        return;
      }

      res.status(200).json(classData);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({
        error: "Error fetching class",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // ✅ Update a class
  static async updateClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, capacity, supervisorId, sectionId } = req.body;

      // Validate Section
      if (sectionId) {
        const sectionExists = await prisma.section.findUnique({
          where: { id: sectionId },
        });
        if (!sectionExists) {
          res.status(400).json({ error: "Section not found" });
          return;
        }
      }

      // Validate Supervisor
      if (supervisorId) {
        const supervisorExists = await prisma.teacher.findUnique({
          where: { id: supervisorId },
        });
        if (!supervisorExists) {
          res.status(400).json({ error: "Supervisor not found" });
          return;
        }
      }

      const updatedClass = await prisma.class.update({
        where: { id: parseInt(id) },
        data: {
          name,
          capacity,
          supervisorId,
          sectionId,
        },
        include: {
          section: true,
          supervisor: true,
        },
      });

      res.status(200).json({
        message: "Class updated successfully",
        updatedClass,
      });
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({
        error: "Error updating class",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // ✅ Delete a class
  static async deleteClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.class.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({
        error: "Error deleting class",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
