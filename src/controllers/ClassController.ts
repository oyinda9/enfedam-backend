import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ClassController {
  // ✅ Create a new class
  static async createClass(req: Request, res: Response): Promise<void> {
    try {
      const { name, capacity, supervisorId } = req.body;

      const newClass = await prisma.class.create({
        data: {
          name,
          capacity,
          supervisorId,
        },
      });

       res.status(201).json({ message: "Class created successfully", newClass });
       return
    } catch (error) {
       res.status(500).json({ error: "Error creating class", details: error });
       return
    }
  }

  // ✅ Get all classes
  static async getAllClasses(req: Request, res: Response): Promise<void>  {
    try {
      const classes = await prisma.class.findMany({
        include: {
          supervisor: true, // Fetch supervisor details
          students: true, // Fetch students
          announcements: true,
          events: true,
          lessons: true,
        },
      });

       res.status(200).json(classes);
       return
    } catch (error) {
       res.status(500).json({ error: "Error fetching classes", details: error });
       return
    }
  }

  // ✅ Get a single class by ID
  static async getClassById(req: Request, res: Response): Promise<void>  {
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
         return
      }

       res.status(200).json(classData);
       return
    } catch (error) {
       res.status(500).json({ error: "Error fetching class", details: error });
       return
    }
  }

  // ✅ Update a class
  static async updateClass(req: Request, res: Response): Promise<void>  {
    try {
      const { id } = req.params;
      const { name, capacity, supervisorId } = req.body;

      const updatedClass = await prisma.class.update({
        where: { id: Number(id) },
        data: {
          name,
          capacity,
          supervisorId,
        },
      });

       res.status(200).json({ message: "Class updated successfully", updatedClass });
       return
    } catch (error) {
       res.status(500).json({ error: "Error updating class", details: error });
       return
    }
  }

  // ✅ Delete a class
  static async deleteClass(req: Request, res: Response): Promise<void>  {
    try {
      const { id } = req.params;

      await prisma.class.delete({
        where: { id: Number(id) },
      });

       res.status(200).json({ message: "Class deleted successfully" });
       return
    } catch (error) {
       res.status(500).json({ error: "Error deleting class", details: error });
       return
    }
  }
}
