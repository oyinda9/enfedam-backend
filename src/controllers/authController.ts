import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Register Admin
export const registerAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password required" });
      return; // Ensure the function exits after sending the response
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "Admin registered", admin });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Failed to register admin" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res
        .status(400)
        .json({ error: "Email, username, and password are required" });
      return;
    }

    let user;
    let role;

    // Check for student
    user = await prisma.student.findUnique({
      where: { email, username },
    });
    if (user) role = "STUDENT";

    // Check for teacher
    if (!user) {
      user = await prisma.teacher.findUnique({
        where: { email, username },
      });
      if (user) role = "TEACHER";
    }

    // Check for parent
    if (!user) {
      user = await prisma.parent.findUnique({
        where: { email, username },
      });
      if (user) role = "USER";
    }

    // If no user is found
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role }, SECRET_KEY, {
      expiresIn: "2h",
    });

    res.status(200).json({ message: "Login successful", token, role });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    // Find Admin by username
    const user = await prisma.admin.findUnique({ where: { username } });

    if (!user) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    // Validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: "ADMIN" }, SECRET_KEY, {
      expiresIn: "2h",
    });

    res.status(200).json({ message: "Login successful", token, role: "ADMIN" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
