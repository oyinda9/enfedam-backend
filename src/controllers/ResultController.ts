import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new result
export const createResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, examId, assignmentId, studentId, subjectId } = req.body;

    const result = await prisma.result.create({
      data: {
        score,
        exam: examId ? { connect: { id: examId } } : undefined,
        assignment: assignmentId ? { connect: { id: assignmentId } } : undefined,
        student: { connect: { id: studentId } },
        subject: { connect: { id: subjectId } },
      },
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all results
export const getAllResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: true,
        subject: true,
        exam: true,
        assignment: true,
      },
    });

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get a result by ID
export const getResultById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await prisma.result.findUnique({
      where: { id: Number(id) },
      include: {
        student: true,
        subject: true,
        exam: true,
        assignment: true,
      },
    });

    if (!result) {
      res.status(404).json({ error: 'Result not found' });
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update a result
export const updateResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { score, examId, assignmentId, studentId, subjectId } = req.body;

    const result = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        score,
        examId,
        assignmentId,
        studentId,
        subjectId,
      },
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a result
export const deleteResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.result.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
