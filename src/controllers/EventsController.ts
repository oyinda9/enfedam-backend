import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const createEvent = async (req: Request, res: Response) => {
    try {
      const { title, description, startTime, endTime, classId } = req.body;
      const event = await prisma.event.create({ data: { title, description, startTime, endTime, classId } });
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create event' });
    }
  };