import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

// WAEC-style grading bands
const calculateGrade = (totalScore: number): string => {
  if (totalScore >= 75) return "A1";
  if (totalScore >= 70) return "B2";
  if (totalScore >= 65) return "B3";
  if (totalScore >= 60) return "C4";
  if (totalScore >= 55) return "C5";
  if (totalScore >= 50) return "C6";
  if (totalScore >= 45) return "D7";
  if (totalScore >= 40) return "E8";
  return "F9";
};

export const getStudentTranscripts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { session, limit } = req.query;

    const transcripts = await prisma.transcript.findMany({
      where: {
        studentId,
        ...(session ? { session: String(session) } : {}),
      },
      include: { subjects: true },
      orderBy: { createdAt: "desc" },
      take: limit ? Number(limit) : 10,
    });

    res.status(200).json({ success: true, data: transcripts });
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    res.status(500).json({ success: false, message: "Unexpected error fetching transcripts.", code: "SERVER_ERROR" });
  }
};

export const createTranscript = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const {
      session,
      className,
      subjects,
      classPosition,
      promotionStatus,
      teacherRemark,
      principalRemark,
    } = req.body;

    if (!session || !className || !Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ success: false, message: "session, className and at least one subject are required.", code: "VALIDATION_ERROR" });
      return;
    }

    for (const s of subjects) {
      if (!s.subjectName || s.caScore == null || s.examScore == null) {
        res.status(400).json({ success: false, message: "Each subject requires subjectName, caScore and examScore.", code: "VALIDATION_ERROR" });
        return;
      }
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found.", code: "NOT_FOUND" });
      return;
    }

    const subjectRows = subjects.map((s: any) => {
      const totalScore = s.caScore + s.examScore;
      return {
        subjectName: s.subjectName,
        caScore: s.caScore,
        examScore: s.examScore,
        totalScore,
        grade: calculateGrade(totalScore),
      };
    });
    const averageScore = subjectRows.reduce((sum, s) => sum + s.totalScore, 0) / subjectRows.length;

    const transcript = await prisma.transcript.create({
      data: {
        studentId,
        session,
        className,
        averageScore,
        classPosition: classPosition || null,
        promotionStatus: promotionStatus || null,
        teacherRemark: teacherRemark || null,
        principalRemark: principalRemark || null,
        subjects: { create: subjectRows },
      },
      include: { subjects: true },
    });

    res.status(201).json({ success: true, message: "Transcript created successfully", data: transcript });
  } catch (error) {
    console.error("Error creating transcript:", error);
    res.status(500).json({ success: false, message: "Unexpected error creating transcript.", code: "SERVER_ERROR" });
  }
};
