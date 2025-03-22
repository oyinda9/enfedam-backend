import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ClassController {
  // ✅ Create a new class
  static async createClass(req: Request, res: Response): Promise<void> {
    try {
      const { name, capacity, supervisorId } = req.body;

      // If supervisorId is provided, check if it exists
      let supervisorData = {};
      if (supervisorId) {
        const supervisorExists = await prisma.teacher.findUnique({
          where: { id: supervisorId },
        });

        if (!supervisorExists) {
          res.status(400).json({ error: "Supervisor not found" });
          return;
        }

        supervisorData = { supervisor: { connect: { id: supervisorId } } };
      }

      const newClass = await prisma.class.create({
        data: {
          name,
          capacity,
          ...supervisorData, // Add supervisor only if it exists
        },
      });

      res.status(201).json({ message: "Class created successfully", newClass });
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(500).json({ error: "Error creating class", details: error.message });
    }
  }

  // ✅ Get all classes
  static async getAllClasses(req: Request, res: Response): Promise<void> {
    try {
      const classes = await prisma.class.findMany({
        include: {
          supervisor: true,
          students: true,
          announcements: true,
          events: true,
          lessons: true,
        },
      });

      res.status(200).json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ error: "Error fetching classes", details: error.message });
    }
  }

  // ✅ Get a single class by ID
  static async getClassById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const classData = await prisma.class.findUnique({
        where: { id: Number(id) },
        include: {
          supervisor: true,
          students: true,
          announcements: true,
          events: true,
          lessons: true,
        },
      });

      if (!classData) {
        res.status(404).json({ error: "Class not found" });
        return;
      }

      res.status(200).json(classData);
    } catch (error) {
      console.error("Error fetching class:", error);
      res.status(500).json({ error: "Error fetching class", details: error.message });
    }
  }

  // ✅ Update a class
  static async updateClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, capacity, supervisorId } = req.body;

      let supervisorData = {};
      if (supervisorId) {
        const supervisorExists = await prisma.teacher.findUnique({
          where: { id: supervisorId },
        });

        if (!supervisorExists) {
          res.status(400).json({ error: "Supervisor not found" });
          return;
        }

        supervisorData = { supervisor: { connect: { id: supervisorId } } };
      }

      const updatedClass = await prisma.class.update({
        where: { id: Number(id) },
        data: {
          name,
          capacity,
          ...supervisorData, // Add supervisor only if it exists
        },
      });

      res.status(200).json({ message: "Class updated successfully", updatedClass });
    } catch (error) {
      console.error("Error updating class:", error);
      res.status(500).json({ error: "Error updating class", details: error.message });
    }
  }

  // ✅ Delete a class
  static async deleteClass(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.class.delete({
        where: { id: Number(id) },
      });

      res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ error: "Error deleting class", details: error.message });
    }
  }
}
