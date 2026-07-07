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

export const getStudentFullAcademicRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const transcripts = await prisma.transcript.findMany({
      where: { studentId },
      include: { subjects: true },
      orderBy: [{ session: "desc" }, { term: "asc" }],
    });

    const bySession = new Map<string, any[]>();
    for (const t of transcripts) {
      const list = bySession.get(t.session) ?? [];
      list.push(t);
      bySession.set(t.session, list);
    }

    const data = Array.from(bySession.entries()).map(([session, sessionTranscripts]) => {
      const summary = buildSessionSummary(session, sessionTranscripts);
      const terms: Record<string, any> = { FIRST: null, SECOND: null, THIRD: null };
      for (const t of sessionTranscripts) {
        if (t.term) terms[t.term] = t;
      }
      return { ...summary, terms };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching full academic record:", error);
    res.status(500).json({ success: false, message: "Unexpected error fetching academic record.", code: "SERVER_ERROR" });
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

    // Enforce First -> Second -> Third order within a session.
    const termIndex = VALID_TERMS.indexOf(normalizedTerm);
    if (termIndex > 0) {
      const requiredPriorTerms = VALID_TERMS.slice(0, termIndex);
      const existingPrior = await prisma.transcript.findMany({
        where: { studentId, session, term: { in: requiredPriorTerms } },
        select: { term: true },
      });
      const existingPriorSet = new Set(existingPrior.map((t) => t.term));
      const missingTerm = requiredPriorTerms.find((t) => !existingPriorSet.has(t));
      if (missingTerm) {
        res.status(400).json({
          success: false,
          message: `${missingTerm} term must be recorded before ${normalizedTerm} term for session ${session}.`,
          code: "VALIDATION_ERROR",
        });
        return;
      }
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

export const updateTranscript = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, transcriptId } = req.params;
    const { className, subjects, classPosition, promotionStatus, teacherRemark, principalRemark } = req.body;

    const existing = await prisma.transcript.findUnique({ where: { id: Number(transcriptId) } });
    if (!existing || existing.studentId !== studentId) {
      res.status(404).json({ success: false, message: "Transcript not found.", code: "NOT_FOUND" });
      return;
    }

    let averageScoreUpdate: number | undefined;
    if (subjects !== undefined) {
      if (!Array.isArray(subjects) || subjects.length === 0) {
        res.status(400).json({ success: false, message: "subjects must be a non-empty array when provided.", code: "VALIDATION_ERROR" });
        return;
      }
      for (const s of subjects) {
        if (!s.subjectName || s.caScore == null || s.examScore == null) {
          res.status(400).json({ success: false, message: "Each subject requires subjectName, caScore and examScore.", code: "VALIDATION_ERROR" });
          return;
        }
      }
      const subjectRows = subjects.map((s: any) => {
        const totalScore = s.caScore + s.examScore;
        return { subjectName: s.subjectName, caScore: s.caScore, examScore: s.examScore, totalScore, grade: calculateGrade(totalScore) };
      });
      averageScoreUpdate = subjectRows.reduce((sum: number, s: any) => sum + s.totalScore, 0) / subjectRows.length;

      await prisma.transcriptSubject.deleteMany({ where: { transcriptId: existing.id } });
      await prisma.transcriptSubject.createMany({ data: subjectRows.map((s: any) => ({ ...s, transcriptId: existing.id })) });
    }

    const transcript = await prisma.transcript.update({
      where: { id: existing.id },
      data: {
        ...(className !== undefined ? { className } : {}),
        ...(classPosition !== undefined ? { classPosition } : {}),
        ...(promotionStatus !== undefined ? { promotionStatus } : {}),
        ...(teacherRemark !== undefined ? { teacherRemark } : {}),
        ...(principalRemark !== undefined ? { principalRemark } : {}),
        ...(averageScoreUpdate !== undefined ? { averageScore: averageScoreUpdate } : {}),
      },
      include: { subjects: true },
    });

    res.status(200).json({ success: true, message: "Transcript updated successfully", data: transcript });
  } catch (error) {
    console.error("Error updating transcript:", error);
    res.status(500).json({ success: false, message: "Unexpected error updating transcript.", code: "SERVER_ERROR" });
  }
};

export const deleteTranscript = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, transcriptId } = req.params;

    const existing = await prisma.transcript.findUnique({ where: { id: Number(transcriptId) } });
    if (!existing || existing.studentId !== studentId) {
      res.status(404).json({ success: false, message: "Transcript not found.", code: "NOT_FOUND" });
      return;
    }

    // Preserve First -> Second -> Third order: block deleting a term while a later one still exists.
    if (existing.term) {
      const termIndex = VALID_TERMS.indexOf(existing.term);
      const laterTerms = VALID_TERMS.slice(termIndex + 1);
      if (laterTerms.length) {
        const laterExists = await prisma.transcript.findFirst({
          where: { studentId, session: existing.session, term: { in: laterTerms } },
          select: { term: true },
        });
        if (laterExists) {
          res.status(400).json({
            success: false,
            message: `Delete ${laterExists.term} term for session ${existing.session} before deleting ${existing.term} term.`,
            code: "VALIDATION_ERROR",
          });
          return;
        }
      }
    }

    await prisma.transcript.delete({ where: { id: existing.id } });

    res.status(200).json({ success: true, message: "Transcript deleted successfully" });
  } catch (error) {
    console.error("Error deleting transcript:", error);
    res.status(500).json({ success: false, message: "Unexpected error deleting transcript.", code: "SERVER_ERROR" });
  }
};
