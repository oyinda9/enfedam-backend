import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client'; 

const prisma = new PrismaClient();

export const createAttendance = async (req: Request, res: Response): Promise<void> => {
  const { studentId, present } = req.body;

  if (!studentId || typeof present !== 'boolean') {
    res.status(400).json({ error: 'Missing required fields: studentId and present' });
    return;
  }

  try {
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        present,
        date: new Date()
      }
    });

    res.status(201).json({
      message: `Attendance marked as ${present ? 'present' : 'absent'} for student with ID ${studentId}.`,
      data: attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create attendance' });
  }
};

export const getAllAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all attendance records
    const attendanceRecords = await prisma.attendance.findMany();

    res.status(200).json({
      message: 'Attendance records fetched successfully',
      data: attendanceRecords
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};