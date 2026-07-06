import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const VALID_TYPES = ["award", "certificate", "honor"];

export const getStudentAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { type, limit } = req.query;

    const achievements = await prisma.achievement.findMany({
      where: {
        studentId,
        ...(type ? { type: String(type) } : {}),
      },
      orderBy: { date: "desc" },
      take: limit ? Number(limit) : 10,
    });

    res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ success: false, message: "Unexpected error fetching achievements.", code: "SERVER_ERROR" });
  }
};

export const createAchievement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { type, title, description, issuer, date, certificateUrl } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      res.status(400).json({ success: false, message: `type must be one of ${VALID_TYPES.join(", ")}.`, code: "VALIDATION_ERROR" });
      return;
    }
    if (!title || !description || !issuer || !date) {
      res.status(400).json({ success: false, message: "title, description, issuer and date are required.", code: "VALIDATION_ERROR" });
      return;
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found.", code: "NOT_FOUND" });
      return;
    }

    const achievement = await prisma.achievement.create({
      data: {
        studentId,
        type,
        title,
        description,
        issuer,
        date: new Date(date),
        certificateUrl: certificateUrl || null,
      },
    });

    res.status(201).json({ success: true, message: "Achievement recorded successfully", data: achievement });
  } catch (error) {
    console.error("Error creating achievement:", error);
    res.status(500).json({ success: false, message: "Unexpected error creating achievement.", code: "SERVER_ERROR" });
  }
};
