import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const createExam = async (req: Request, res: Response) => {
    try {
      const { title, startTime, endTime, lessonId } = req.body;
      const exam = await prisma.exam.create({ data: { title, startTime, endTime, lessonId } });
      res.status(201).json(exam);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create exam' });
    }
  };
  