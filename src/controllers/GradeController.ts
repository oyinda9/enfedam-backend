import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🟢 Create a new grade
export const createGrade = async (req: Request, res: Response) => {
  const { level } = req.body;

  try {
    const grade = await prisma.grade.create({
      data: { level },
    });
    res.status(201).json(grade);
  } catch (error) {
    res.status(400).json({ error: "Failed to create grade" });
  }
};


export const getAllGrades = async (req: Request, res: Response) => {
  try {
    const grades = await prisma.grade.findMany({
      include: { students: true, classess: true }, // Include related data
    });
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch grades" });
  }
};


export const getGradeById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const grade = await prisma.grade.findUnique({
      where: { id: Number(id) },
      include: { students: true, classess: true },
    });

    if (!grade) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.status(200).json(grade);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch grade' });
  }
};


export const updateGrade = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { level } = req.body;

  try {
    const grade = await prisma.grade.update({
      where: { id: Number(id) },
      data: { level },
    });

    res.status(200).json(grade);
  } catch (error) {
    res.status(400).json({ error: "Failed to update grade" });
  }
};


export const deleteGrade = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.grade.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete grade" });
  }
};
