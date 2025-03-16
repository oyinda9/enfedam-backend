import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { connect } from "http2";

const prisma = new PrismaClient();

export const createTeacher = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      username,
      name,
      surname,
      email,
      phone,
      address,
      img,
      bloodType,
      sex,
      birthday,
      subjectIds,
      lessonIds,
      classIds,
    } = req.body;

    // Check if the username already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { username },
    });
    if (existingTeacher) {
      res
        .status(400)
        .json({ error: "Teacher with this username already exists" });
      return;
    }

    // Generate a new teacher ID
    const count = await prisma.teacher.count();
    const newTeacherId = `teacher${count + 1}`;

    // Validate birthday format
    const parsedBirthday = new Date(birthday);
    if (isNaN(parsedBirthday.getTime())) {
      res.status(400).json({ error: "Invalid birthday format" });
      return;
    }

    // Create teacher
    const teacher = await prisma.teacher.create({
      data: {
        id: crypto.randomUUID(),
        username,
        name,
        surname,
        email,
        phone,
        address,
        img,
        bloodType,
        sex,
        birthday: parsedBirthday,
        ...(subjectIds && subjectIds.length > 0
          ? { subjects: { connect: subjectIds.map((id: string) => ({ id })) } }
          : {}),
        ...(lessonIds && lessonIds.length > 0
          ? { lessons: { connect: lessonIds.map((id: string) => ({ id })) } }
          : {}),
        ...(classIds && classIds.length > 0
          ? { classes: { connect: classIds.map((id: string) => ({ id })) } }
          : {}),
      },
    });

    res.status(201).json(teacher);
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ error: "Failed to create teacher" });
  }
};

// ✅ Get All Teachers
export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
};

// ✅ Get a Single Teacher by ID
export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({ where: { id } });

    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teacher" });
  }
};

// ✅ Update a Teacher
export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ error: "Failed to update teacher" });
  }
};

// ✅ Delete a Teacher
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id } });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete teacher" });
  }
};
