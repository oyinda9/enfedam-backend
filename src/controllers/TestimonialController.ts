import { Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

const toResponse = (t: any) => ({
  id: t.id,
  studentId: t.studentId,
  fromTeacher: t.teacher ? `${t.teacher.name} ${t.teacher.surname}` : "School Administration",
  teacherId: t.teacherId,
  subject: t.subject,
  content: t.content,
  rating: t.rating,
  isRecommendation: t.isRecommendation,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

export const getStudentTestimonials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { limit, sortBy } = req.query;

    const testimonials = await prisma.testimonial.findMany({
      where: { studentId },
      include: { teacher: { select: { name: true, surname: true } } },
      orderBy: sortBy === "rating" ? { rating: "desc" } : { createdAt: "desc" },
      take: limit ? Number(limit) : 10,
    });

    res.status(200).json({ success: true, data: testimonials.map(toResponse) });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ success: false, message: "Unexpected error fetching testimonials.", code: "SERVER_ERROR" });
  }
};

export const createTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { subject, content, rating, isRecommendation } = req.body;

    if (!subject || !content || rating == null) {
      res.status(400).json({ success: false, message: "subject, content and rating are required.", code: "VALIDATION_ERROR" });
      return;
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ success: false, message: "Student not found.", code: "NOT_FOUND" });
      return;
    }

    const isTeacher = req.user!.role === Role.TEACHER;

    const testimonial = await prisma.testimonial.create({
      data: {
        studentId,
        teacherId: isTeacher ? req.user!.id : null,
        subject,
        content,
        rating,
        isRecommendation: Boolean(isRecommendation),
      },
      include: { teacher: { select: { name: true, surname: true } } },
    });

    res.status(201).json({ success: true, message: "Testimonial created successfully", data: toResponse(testimonial) });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).json({ success: false, message: "Unexpected error creating testimonial.", code: "SERVER_ERROR" });
  }
};
