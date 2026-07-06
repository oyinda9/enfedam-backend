import { Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const VALID_TYPES = ["positive", "negative", "neutral"];
const VALID_SEVERITIES = ["none", "low", "medium", "high"];

const resolveRecordedBy = async (req: AuthRequest): Promise<string> => {
  if (req.user!.role === Role.TEACHER) {
    const teacher = await prisma.teacher.findUnique({ where: { id: req.user!.id } });
    if (teacher) return `${teacher.name} ${teacher.surname}`;
  }
  if (req.user!.role === Role.ADMIN) {
    const admin = await prisma.admin.findUnique({ where: { id: req.user!.id } });
    if (admin) return admin.username;
  }
  return "Unknown";
};

export const getStudentConduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { type, limit } = req.query;

    const records = await prisma.conductRecord.findMany({
      where: {
        studentId,
        ...(type ? { type: String(type) } : {}),
      },
      orderBy: { date: "desc" },
      take: limit ? Number(limit) : 10,
    });

    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Error fetching conduct records:", error);
    res.status(500).json({ success: false, message: "Unexpected error fetching conduct records.", code: "SERVER_ERROR" });
  }
};

export const createConductRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { type, title, description, severity, action, date } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      res.status(400).json({ success: false, message: `type must be one of ${VALID_TYPES.join(", ")}.`, code: "VALIDATION_ERROR" });
      return;
    }
    if (!severity || !VALID_SEVERITIES.includes(severity)) {
      res.status(400).json({ success: false, message: `severity must be one of ${VALID_SEVERITIES.join(", ")}.`, code: "VALIDATION_ERROR" });
      return;
    }
    if (!title || !description || !action || !date) {
      res.status(400).json({ success: false, message: "title, description, action and date are required.", code: "VALIDATION_ERROR" });
      return;
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found.", code: "NOT_FOUND" });
      return;
    }

    const recordedBy = await resolveRecordedBy(req);

    const record = await prisma.conductRecord.create({
      data: {
        studentId,
        type,
        title,
        description,
        severity,
        action,
        date: new Date(date),
        recordedBy,
      },
    });

    res.status(201).json({ success: true, message: "Conduct record created successfully", data: record });
  } catch (error) {
    console.error("Error creating conduct record:", error);
    res.status(500).json({ success: false, message: "Unexpected error creating conduct record.", code: "SERVER_ERROR" });
  }
};
