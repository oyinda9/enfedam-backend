import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const markAttendance = async (req: Request, res: Response) => {
    try {
      const { date, present, studentId, lessonId } = req.body;
      const attendance = await prisma.attendance.create({ data: { date, present, studentId, lessonId } });
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark attendance' });
    }
  };
  