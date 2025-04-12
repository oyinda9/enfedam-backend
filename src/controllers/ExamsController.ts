import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

const prisma = new PrismaClient()

// Create a new exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const { subjectId, score } = req.body

    const newExam = await prisma.exam.create({
      data: {
        subjectId,
        score,
      },
    })

    res.status(201).json(newExam)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create exam' })
  }
}

// Add a student's score for an exam
export const addExamScore = async (req: Request, res: Response) : Promise<void> => {
  try {
    const { studentId, subjectId, examId, score } = req.body

    const examExists = await prisma.exam.findUnique({
      where: { id: examId },
    })

    if (!examExists) {
       res.status(404).json({ message: 'Exam not found' })
       return
    }

    const examScore = await prisma.examScore.upsert({
      where: {
        studentId_subjectId: {
          studentId,
          subjectId,
        },
      },
      update: {
        score,
      },
      create: {
        studentId,
        subjectId,
        score,
      },
    })

    res.status(200).json(examScore)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to add exam score' })
  }
}

// Get all exams with scores
export const getAllExamsWithScores = async (req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        subject: true,
        examScores: {
          include: {
            student: true,
            subject: true,
          },
        },
      },
    })

    res.status(200).json(exams)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch exams' })
  }
}
