import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Create a new class
export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, capacity, supervisorId } = req.body;

    // Check if class name already exists
    const existingClass = await prisma.class.findUnique({
      where: { name },
    });

    if (existingClass) {
      res.status(400).json({ error: "Class with this name already exists" });
      return;
    }

    // Validate if supervisorId exists
    if (supervisorId) {
      const supervisorExists = await prisma.teacher.findUnique({
        where: { id: supervisorId },
      });

      if (!supervisorExists) {
        res.status(404).json({ error: "Supervisor not found" });
        return;
      }
    }

    // Create the class
    // const newClass = await prisma.class.create({
    //   data: {
    //     name,
    //     capacity,
    //     supervisor: { connect: { id: supervisorId } }

    //   },
    // });
    const newClass = await prisma.class.create({
      data: {
        name,
        capacity,
        supervisor: supervisorId ? { connect: { id: supervisorId } } : undefined,
      } as any, // Temporary fix to bypass TypeScript validation
    });
    
    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ error: "Failed to create class" });
  }
};
//get all classes
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: {
        supervisor: true,
        lessons: true,
        students: true,
        events: true,
        announcements: true,
      },
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "failed to fetch students" });
  }
};

// Get a classes by ID
export const getclassesById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const classId = Number(id);
  try {
    const classes = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        supervisor: true,
        lessons: true,
        students: true,
        events: true,
        announcements: true,
      },
    });
    if (!classes) {
      return res.status(404).json({ error: "classes not found" });
    }
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};
//update a class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classId = Number(id);
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: req.body,
    });

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
};

// Delete a class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id } });
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Class" });
  }
};
