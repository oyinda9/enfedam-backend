import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createSubject =  async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, classId } = req.body;

    // Check if the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!existingClass) {
       res.status(404).json({ error: 'Class not found' });
       return
    }

    // Create the subject
    const subject = await prisma.subject.create({
      data: {
        name,
        classId ,
      },
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Error creating subject:', error);
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