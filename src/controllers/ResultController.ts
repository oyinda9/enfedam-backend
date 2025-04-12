import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

// Create a new result
export const createResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { score, examId, studentId, subjectId } = req.body
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    
    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }
    // Create a new result entry in the database
    const result = await prisma.result.create({
      data: {
        score,
        exam: {
          connect: { id: examId },
        },
        student: {
          connect: { id: studentId },
        },
        subject: {
          connect: { id: subjectId },
        },
      },
    })

    res.status(201).json(result)  // Respond with the created result
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create result' })
  }
}

// Get all results
export const getAllResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: true,
        exam: true,
        subject: true,
      },
    })

    res.status(200).json(results)  // Respond with the list of results
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch results' })
  }
}

// Get a result by ID
export const getResultById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
  
    const result = await prisma.result.findUnique({
      where: { id: Number(id) },
      include: {
        student: true,
        exam: true,
        subject: true,
      },
    })
  
    if (!result) {
      res.status(404).json({ message: 'Result not found' })
      return
    }
  
    res.status(200).json(result)  // Respond with the result
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch result' })
  }
}
export const getResultsByStudentId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    // Retrieve all results for a specific student
    const results = await prisma.result.findMany({
      where: { studentId },
      include: {
        student: true,
        subject: true, // Include related subject details if needed
      },
    });

    if (results.length === 0) {
      res.status(404).json({ message: 'No results found for this student' });
      return;
    }

    res.status(200).json(results); // Respond with the list of results for the student
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};

// Update a result
export const updateResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { score, examId, studentId, subjectId } = req.body
  
    const result = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        score,
        exam: examId ? { connect: { id: examId } } : undefined,
        student: studentId ? { connect: { id: studentId } } : undefined,
        subject: subjectId ? { connect: { id: subjectId } } : undefined,
      },
    })
  
    res.status(200).json(result)  // Respond with the updated result
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to update result' })
  }
}

// Delete a result
export const deleteResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
  
    await prisma.result.delete({
      where: { id: Number(id) },
    })
  
    res.status(200).json({ message: 'Result deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to delete result' })
  }
}
