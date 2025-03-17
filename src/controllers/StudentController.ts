import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: { parent: true, class: true, grade: true },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// Get a student by ID
export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { parent: true, class: true, grade: true },
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

// Create a new student
export const createStudent = async (req: Request, res: Response) => {
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
    parentId,
    classId,
    gradeId,
    birthday,
  } = req.body;

  try {
    const student = await prisma.student.create({
      data: {
        id: crypto.randomUUID(),
        username,
        name,
        surname,
        email: email || null,
        phone: phone || null,
        address,
        img: img || null,
        bloodType,
        sex,
        birthday: new Date(birthday),
        ...(parentId && { parent: { connect: { id: parentId } } }),
        ...(classId && { class: { connect: { id: classId } } }),
        ...(gradeId && { grade: { connect: { id: gradeId } } }),
      },
    });

    res.status(201).json(student);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create student" });
  }
};

// Update a student
export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
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
    parentId,
    classId,
    gradeId,
    birthday,
  } = req.body;
  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        username,
        name,
        surname,
        email,
        phone,
        address,
        img,
        bloodType,
        sex,
        parentId,
        classId,
        gradeId,
        birthday,
      },
    });
    res.json(student);
  } catch (error) {
    res.status(400).json({ error: "Failed to update student" });
  }
};

// Delete a student
export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.student.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: "Failed to delete student" });
  }
};
