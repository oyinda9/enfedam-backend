import { Response } from "express";
import { PrismaClient, Term } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const VALID_TERMS: Term[] = [Term.FIRST, Term.SECOND, Term.THIRD];

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

// Cumulative summary across whatever terms have been recorded for one session
const buildSessionSummary = (session: string, transcripts: any[]) => {
  const termsRecorded = transcripts.map((t) => t.term).filter(Boolean);
  const cumulativeAverage = transcripts.length
    ? Number((transcripts.reduce((sum, t) => sum + t.averageScore, 0) / transcripts.length).toFixed(2))
    : 0;

  const bySubject = new Map<string, { totalScoreSum: number; count: number }>();
  for (const t of transcripts) {
    for (const s of t.subjects) {
      const entry = bySubject.get(s.subjectName) ?? { totalScoreSum: 0, count: 0 };
      entry.totalScoreSum += s.totalScore;
      entry.count += 1;
      bySubject.set(s.subjectName, entry);
    }
  }
  const subjects = Array.from(bySubject.entries()).map(([subjectName, { totalScoreSum, count }]) => ({
    subjectName,
    termsRecorded: count,
    cumulativeAverage: Number((totalScoreSum / count).toFixed(2)),
  }));

  return { session, termsRecorded, cumulativeAverage, subjects };
};

export const getStudentTranscripts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { session, term, limit } = req.query;

    const transcripts = await prisma.transcript.findMany({
      where: {
        studentId,
        ...(session ? { session: String(session) } : {}),
        ...(term ? { term: String(term).toUpperCase() as Term } : {}),
      },
      include: { subjects: true },
      orderBy: [{ session: "desc" }, { term: "asc" }],
      take: limit ? Number(limit) : 10,
    });

    const summary = session ? buildSessionSummary(String(session), transcripts) : undefined;

    res.status(200).json({ success: true, data: transcripts, ...(summary ? { summary } : {}) });
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
      term,
      className,
      subjects,
      classPosition,
      promotionStatus,
      teacherRemark,
      principalRemark,
    } = req.body;

    if (!session || !className) {
      res.status(400).json({ success: false, message: "session and className are required.", code: "VALIDATION_ERROR" });
      return;
    }

    const normalizedTerm = typeof term === "string" ? (term.toUpperCase() as Term) : undefined;
    if (!normalizedTerm || !VALID_TERMS.includes(normalizedTerm)) {
      res.status(400).json({ success: false, message: `term must be one of ${VALID_TERMS.join(", ")}.`, code: "VALIDATION_ERROR" });
      return;
    }

    const manualSubjects = Array.isArray(subjects) ? subjects : [];
    for (const s of manualSubjects) {
      if (!s.subjectName || s.caScore == null || s.examScore == null) {
        res.status(400).json({ success: false, message: "Each manually-supplied subject requires subjectName, caScore and examScore.", code: "VALIDATION_ERROR" });
        return;
      }
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found.", code: "NOT_FOUND" });
      return;
    }

    // Auto-fill from already-recorded Results for this student/session/term.
    const existingResults = await prisma.result.findMany({
      where: { studentId, session, term: normalizedTerm },
      include: { subject: true },
    });

    const bySubjectName = new Map<string, { subjectName: string; caScore: number; examScore: number }>();
    for (const r of existingResults) {
      bySubjectName.set(r.subject.name, {
        subjectName: r.subject.name,
        caScore: r.assignment + r.classwork + r.midterm + r.attendance,
        examScore: r.examScore ?? 0,
      });
    }
    // Manually-supplied subjects take precedence over auto-filled ones for the same subject.
    for (const s of manualSubjects) {
      bySubjectName.set(s.subjectName, { subjectName: s.subjectName, caScore: s.caScore, examScore: s.examScore });
    }

    const mergedSubjects = Array.from(bySubjectName.values());
    if (mergedSubjects.length === 0) {
      res.status(400).json({
        success: false,
        message: "No recorded results found for this session/term, and no subjects were provided manually.",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    const subjectRows = mergedSubjects.map((s) => {
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
        term: normalizedTerm,
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
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ success: false, message: "A transcript for this student/session/term already exists.", code: "DUPLICATE_ENTRY" });
      return;
    }
    console.error("Error creating transcript:", error);
    res.status(500).json({ success: false, message: "Unexpected error creating transcript.", code: "SERVER_ERROR" });
  }
};
