import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================== SUBJECT CONTROLLERS ==================
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const subject = await prisma.subject.create({ data: { name } });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const getAllSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({ include: { teachers: true, lessons: true ,exams:true } });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};