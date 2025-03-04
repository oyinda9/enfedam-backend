import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const createResult = async (req: Request, res: Response) => {
    try {
      const { score, examId, assignmentId, studentId } = req.body;
      const result = await prisma.result.create({ data: { score, examId, assignmentId, studentId } });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create result' });
    }
  };