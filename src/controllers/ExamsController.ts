import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

// Create a new exam
export const createExamScore = async (req: Request, res: Response): Promise<void> => {
    try {
      const { score, examId, studentId, subjectId } = req.body;
  
      // Create a new result for a student
      const result = await prisma.result.create({
        data: {
          score,
          exam: {
            connect: { id: examId },  // Connect to the exam
          },
          student: {
            connect: { id: studentId },  // Connect to the student
          },
          subject: {
            connect: { id: subjectId },  // Connect to the subject
          },
        },
      });
  
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error});
    }
  };

// Get a specific exam score (result) by its ID
export const getExamScoreById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params
  
      // Fetch the result by its ID, including student, exam, and subject details
      const result = await prisma.result.findUnique({
        where: { id: Number(id) },
        include: {
          student: true,  // Include student details
          exam: true,     // Include exam details
          subject: true,  // Include subject details
        },
      })
  
      if (!result) {
        res.status(404).json({ message: 'Result not found' })
        return
      }
  
      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Failed to fetch exam score' })
    }
  }

  // Get all exam scores (results) for all students
export const getAllExamScores = async (req: Request, res: Response): Promise<void> => {
    try {
      // Fetch all results with student, exam, and subject information
      const results = await prisma.result.findMany({
        include: {
          student: true,  // Include student details for each result
          exam: true,     // Include exam details for each result
          subject: true,  // Include subject details for each result
        },
      })
    
      res.status(200).json(results)  // Respond with the list of results
    } catch (error) {
      console.error(error)  // Log the error for debugging
      res.status(500).json({ message: 'Failed to fetch exam scores' })  // Respond with an error message
    }
  }