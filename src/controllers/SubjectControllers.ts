import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createSubject = async (
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
      res.status(404).json({ message: 'Class not found. Please provide a valid class.' });
      return;
    }

    // Create the subject
    const createdSubject = await prisma.subject.create({
      data: {
        name,
        classId,
      },
    });

    // Fetch the subject again including the class relation
    const subjectWithClass = await prisma.subject.findUnique({
      where: { id: createdSubject.id },
      include: {
        class: {
          select: {
            id: true,
            name: true, // Include class name
          },
        },
      },
    });

    res.status(201).json({
      message: 'Subject created successfully.',
      data: subjectWithClass,
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 'P2002'
    ) {
      res.status(409).json({ message: 'Subject with this name already exists in the class.' });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred while creating the subject.' });
    }
  }
};

export const getAllSubjects = async (_req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        teachers: true,
        lessons: true,
        exams: true,
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Subjects fetched successfully.',
      data: subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      message: 'An error occurred while fetching subjects.',
    });
  }
};
