import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ================== LESSON CONTROLLERS ==================
export const createLesson = async (req: Request, res: Response) => {
    try {
      const { name, day, startTime, endTime, subjectId, classId, teacherId } = req.body;
      const lesson = await prisma.lesson.create({
        data: { name, day, startTime, endTime, subjectId, classId, teacherId },
      });
      res.status(201).json(lesson);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create lesson' });
    }
  };
  
  export const getAllLessons = async (_req: Request, res: Response) => {
    try {
      const lessons = await prisma.lesson.findMany({ include: { subject: true, class: true, teacher: true } });
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  };