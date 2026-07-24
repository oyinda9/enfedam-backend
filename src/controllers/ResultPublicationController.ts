import { Response } from "express";
import { PrismaClient, Term, PublicationStatus, Role } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const VALID_TERMS: Term[] = [Term.FIRST, Term.SECOND, Term.THIRD];

const normalizeTerm = (term: unknown): Term | undefined => {
  const t = typeof term === "string" ? (term.toUpperCase() as Term) : undefined;
  return t && VALID_TERMS.includes(t) ? t : undefined;
};

// POST /result-publications/submit - teacher (must supervise the class) or admin
// marks a class's results ready for admin review.
export const submitForReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, session, term } = req.body;
    const normalizedTerm = normalizeTerm(term);
    if (!classId || !session || !normalizedTerm) {
      res.status(400).json({ success: false, message: "classId, session and term are required.", code: "VALIDATION_ERROR" });
      return;
    }

    const classData = await prisma.class.findUnique({ where: { id: Number(classId) } });
    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found.", code: "NOT_FOUND" });
      return;
    }
    if (req.user!.role === Role.TEACHER && classData.supervisorId !== req.user!.id) {
      res.status(403).json({ success: false, message: "You do not supervise this class.", code: "FORBIDDEN" });
      return;
    }

    const existing = await prisma.resultPublication.findUnique({
      where: { classId_session_term: { classId: Number(classId), session, term: normalizedTerm } },
    });
    if (existing?.status === PublicationStatus.PUBLISHED) {
      res.status(400).json({
        success: false,
        message: "Results are already published. Ask an admin to unpublish before resubmitting.",
        code: "ALREADY_PUBLISHED",
      });
      return;
    }

    const publication = await prisma.resultPublication.upsert({
      where: { classId_session_term: { classId: Number(classId), session, term: normalizedTerm } },
      update: { status: PublicationStatus.SUBMITTED, submittedBy: req.user!.id, submittedAt: new Date() },
      create: {
        classId: Number(classId),
        session,
        term: normalizedTerm,
        status: PublicationStatus.SUBMITTED,
        submittedBy: req.user!.id,
        submittedAt: new Date(),
      },
    });

    res.status(200).json({ success: true, message: "Submitted for review.", data: publication });
  } catch (error) {
    console.error("Error submitting results for review:", error);
    res.status(500).json({ success: false, message: "Unexpected error submitting results for review.", code: "SERVER_ERROR" });
  }
};

// POST /result-publications/publish - admin releases a class's results to parents.
export const publishResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, session, term } = req.body;
    const normalizedTerm = normalizeTerm(term);
    if (!classId || !session || !normalizedTerm) {
      res.status(400).json({ success: false, message: "classId, session and term are required.", code: "VALIDATION_ERROR" });
      return;
    }

    const existing = await prisma.resultPublication.findUnique({
      where: { classId_session_term: { classId: Number(classId), session, term: normalizedTerm } },
    });
    if (!existing || existing.status !== PublicationStatus.SUBMITTED) {
      res.status(400).json({
        success: false,
        message: `Cannot publish - current status is ${existing?.status ?? PublicationStatus.DRAFT}. The class must be submitted for review first.`,
        code: "NOT_SUBMITTED",
      });
      return;
    }

    const publication = await prisma.resultPublication.update({
      where: { classId_session_term: { classId: Number(classId), session, term: normalizedTerm } },
      data: { status: PublicationStatus.PUBLISHED, publishedBy: req.user!.id, publishedAt: new Date() },
    });

    res.status(200).json({ success: true, message: "Results published.", data: publication });
  } catch (error) {
    console.error("Error publishing results:", error);
    res.status(500).json({ success: false, message: "Unexpected error publishing results.", code: "SERVER_ERROR" });
  }
};

// POST /result-publications/unpublish - admin pulls a class's results back for correction.
export const unpublishResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, session, term } = req.body;
    const normalizedTerm = normalizeTerm(term);
    if (!classId || !session || !normalizedTerm) {
      res.status(400).json({ success: false, message: "classId, session and term are required.", code: "VALIDATION_ERROR" });
      return;
    }

    const existing = await prisma.resultPublication.findUnique({
      where: { classId_session_term: { classId: Number(classId), session, term: normalizedTerm } },
    });
    if (!existing || existing.status !== PublicationStatus.PUBLISHED) {
      res.status(400).json({ success: false, message: "This class's results are not currently published.", code: "NOT_PUBLISHED" });
      return;
    }

    const publication = await prisma.resultPublication.update({
      where: { classId_session_term: { classId: Number(classId), session, term: normalizedTerm } },
      data: { status: PublicationStatus.DRAFT },
    });

    res.status(200).json({ success: true, message: "Results pulled back for correction.", data: publication });
  } catch (error) {
    console.error("Error unpublishing results:", error);
    res.status(500).json({ success: false, message: "Unexpected error unpublishing results.", code: "SERVER_ERROR" });
  }
};

// GET /result-publications?classId=&session=&term= - single class status (teacher must
// supervise it, or admin). Omit classId as an admin to get the full release queue instead.
export const listPublications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, session, term } = req.query;
    const normalizedTerm = normalizeTerm(term);
    if (!session || !normalizedTerm) {
      res.status(400).json({ success: false, message: "session and term query params are required.", code: "VALIDATION_ERROR" });
      return;
    }

    if (classId) {
      const classData = await prisma.class.findUnique({ where: { id: Number(classId) } });
      if (!classData) {
        res.status(404).json({ success: false, message: "Class not found.", code: "NOT_FOUND" });
        return;
      }
      if (req.user!.role === Role.TEACHER && classData.supervisorId !== req.user!.id) {
        res.status(403).json({ success: false, message: "You do not supervise this class.", code: "FORBIDDEN" });
        return;
      }

      const publication = await prisma.resultPublication.findUnique({
        where: { classId_session_term: { classId: Number(classId), session: String(session), term: normalizedTerm } },
      });

      res.status(200).json({
        success: true,
        data: publication ?? {
          classId: Number(classId),
          session: String(session),
          term: normalizedTerm,
          status: PublicationStatus.DRAFT,
          submittedBy: null,
          submittedAt: null,
          publishedBy: null,
          publishedAt: null,
        },
      });
      return;
    }

    // No classId - the full release queue, admin only.
    if (req.user!.role !== Role.ADMIN) {
      res.status(403).json({
        success: false,
        message: "Only admins can view the full release queue. Pass classId to check one class.",
        code: "FORBIDDEN",
      });
      return;
    }

    const [classes, publications] = await Promise.all([
      prisma.class.findMany({ select: { id: true, name: true, section: { select: { name: true } } } }),
      prisma.resultPublication.findMany({ where: { session: String(session), term: normalizedTerm } }),
    ]);

    const byClassId = new Map(publications.map((p) => [p.classId, p]));
    const data = classes.map((c) => {
      const p = byClassId.get(c.id);
      return {
        classId: c.id,
        className: c.name,
        section: c.section?.name ?? null,
        session: String(session),
        term: normalizedTerm,
        status: p?.status ?? PublicationStatus.DRAFT,
        submittedBy: p?.submittedBy ?? null,
        submittedAt: p?.submittedAt ?? null,
        publishedBy: p?.publishedBy ?? null,
        publishedAt: p?.publishedAt ?? null,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error listing publication statuses:", error);
    res.status(500).json({ success: false, message: "Unexpected error listing publication statuses.", code: "SERVER_ERROR" });
  }
};

// GET /result-publications/status?studentId=&session=&term= - resolves a student to
// their class's publication status. This is the parent/student-facing check.
export const getStudentPublicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, session, term } = req.query;
    const normalizedTerm = normalizeTerm(term);
    if (!studentId || !session || !normalizedTerm) {
      res.status(400).json({ success: false, message: "studentId, session and term query params are required.", code: "VALIDATION_ERROR" });
      return;
    }

    if (req.user!.role === Role.STUDENT && req.user!.id !== studentId) {
      res.status(403).json({ success: false, message: "Forbidden. You may only check your own records.", code: "FORBIDDEN" });
      return;
    }
    if (req.user!.role === Role.USER) {
      const owned = await prisma.student.findUnique({ where: { id: String(studentId) }, select: { parentId: true } });
      if (owned?.parentId !== req.user!.id) {
        res.status(403).json({ success: false, message: "Forbidden. You may only check your own child's records.", code: "FORBIDDEN" });
        return;
      }
    }

    const student = await prisma.student.findUnique({ where: { id: String(studentId) }, include: { class: true } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found.", code: "NOT_FOUND" });
      return;
    }

    const publication = await prisma.resultPublication.findUnique({
      where: { classId_session_term: { classId: student.classId, session: String(session), term: normalizedTerm } },
    });

    res.status(200).json({
      success: true,
      data: {
        classId: student.classId,
        className: student.class.name,
        session: String(session),
        term: normalizedTerm,
        status: publication?.status ?? PublicationStatus.DRAFT,
      },
    });
  } catch (error) {
    console.error("Error resolving student publication status:", error);
    res.status(500).json({ success: false, message: "Unexpected error resolving publication status.", code: "SERVER_ERROR" });
  }
};
