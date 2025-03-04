import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ================== ANNOUNCEMENT CONTROLLERS ==================
export const createAnnouncement = async (req: Request, res: Response) => {
    try {
      const { title, description, date, classId } = req.body;
      const announcement = await prisma.announcement.create({ data: { title, description, date, classId } });
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create announcement' });
    }
  };
  