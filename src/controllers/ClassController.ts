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

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name,
        capacity,
        supervisor: supervisorId ? { connect: { id: supervisorId } } : undefined,
      },
      include: {
        supervisor: true,
      },
    });

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ error: "Failed to create class" });
  }
};

// Get all classes
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
    res.status(500).json({ error: "Failed to fetch classes" });
  }
};

// Get a class by ID
export const getClassById = async (req: Request, res: Response): Promise<void> => {
  try {
    const classId = Number(req.params.id);

    if (isNaN(classId)) {
       res.status(400).json({ error: "Invalid class ID" });return

    }

    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        supervisor: true,
        lessons: true,
        students: true,
        events: true,
        announcements: true,
      },
    });

    if (!classData) {
       res.status(404).json({ error: "Class not found" });
       return
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch class" });
  }
};

// Update a class
export const updateClass = async (req: Request, res: Response) : Promise<void> => {
  try {
    const classId = Number(req.params.id);

    if (isNaN(classId)) {
       res.status(400).json({ error: "Invalid class ID" });
       return
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: req.body,
    });

    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: "Failed to update class" });
  }
};

// Delete a class
export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const classId = Number(req.params.id);

    if (isNaN(classId)) {
       res.status(400).json({ error: "Invalid class ID" });
       return
    }

    await prisma.class.delete({ where: { id: classId } });
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete class" });
  }
};
