import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const getFullReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        parent: true,
        class: {
          include: {
            supervisor: true,
            subjects: true,
            students: true,
            announcements: true,
          },
        },
        Subject: true,
        payments: true,
        attendances: true,
        results: {
          include: {
            exam: true,
            subject: true,
          },
        },
      },
    });

    const teachers = await prisma.teacher.findMany({
      include: {
        classes: true,
        subjects: true,
        lessons: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
    });

    const classes = await prisma.class.findMany({
      include: {
        supervisor: true,
        students: true,
        subjects: true,
        lessons: {
          include: {
            teacher: true,
            subject: true,
          },
        },
        announcements: true,
      },
    });

    const parents = await prisma.parent.findMany({
      include: {
        students: true,
        payments: true,
      },
    });

    const payments = await prisma.payment.findMany({
      include: {
        parent: true,
        student: true,
      },
    });

    const events = await prisma.event.findMany();
    const announcements = await prisma.announcement.findMany({
      include: {
        class: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        students,
        teachers,
        classes,
        parents,
        payments,
        events,
        announcements,
      },
    });
  } catch (error) {
    console.error("Error generating full report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
