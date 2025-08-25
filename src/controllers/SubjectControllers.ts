import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a Subject and link it to one or more Classes
 */
export const createSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, classIds } = req.body; // classIds = array of class IDs to connect

    if (!name || !Array.isArray(classIds) || classIds.length === 0) {
      res.status(400).json({ message: 'Name and at least one classId are required.' });
      return;
    }

    // Check if all classes exist
    const existingClasses = await prisma.class.findMany({
      where: { id: { in: classIds } },
    });

    if (existingClasses.length !== classIds.length) {
      res.status(404).json({ message: 'One or more classes not found.' });
      return;
    }

    // Create the subject and connect to classes
    const createdSubject = await prisma.subject.create({
      data: {
        name,
        classes: {
          connect: classIds.map((id: number) => ({ id })),
        },
      },
      include: {
        classes: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      message: 'Subject created successfully.',
      data: createdSubject,
    });
  } catch (error: any) {
    console.error('Error creating subject:', error);

    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Subject with this name already exists.' });
    } else {
      res.status(500).json({ message: 'Unexpected error creating subject.' });
    }
  }
};

/**
 * Get all Subjects with their Classes, Teachers, Lessons, Exams
 */
export const getAllSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        classes: { select: { id: true, name: true } },
        teachers: { select: { id: true, name: true } },
        lessons: true,
        exams: true,
      },
    });

    res.status(200).json({
      message: 'Subjects fetched successfully.',
      data: subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Unexpected error fetching subjects.' });
  }
};
