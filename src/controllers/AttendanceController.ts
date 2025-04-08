import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'; // Make sure Prisma is imported

const prisma = new PrismaClient(); // Initialize Prisma Client

export const createAttendance = async (req: Request, res: Response): Promise<void> => {
  const { studentId, present } = req.body;

  // Validate required fields
  if (!studentId || typeof present !== 'boolean') {
    res.status(400).json({ error: 'Missing required fields: studentId and present' });
    return;  // Exit after sending the response
  }

  try {
    // Create attendance record in the database
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        present,
        date: new Date()
      }
    });
    
    // Send success response with created attendance
    res.status(201).json(attendance);
  } catch (error) {
    // Send error response if creation fails
    console.error(error);  // Log the error for debugging purposes
    res.status(500).json({ error: 'Failed to create attendance' });
  }
};
