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

//  Login Admin
// export const loginAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { username, password } = req.body;

//     // Find the admin by username
//     const admin = await prisma.admin.findUnique({ where: { username } });

//     if (!admin) {
//       res.status(404).json({ error: "Admin not found" });
//       return; // Ensure the function exits after sending the response
//     }

//     // Compare the provided password with the hashed password
//     const isValid = await bcrypt.compare(password, admin.password);
//     if (!isValid) {
//       res.status(401).json({ error: "Invalid credentials" });
//       return; // Ensure the function exits after sending the response
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ id: admin.id, role: "ADMIN" }, SECRET_KEY, {
//       expiresIn: "2h",
//     });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ error: "Login failed" });
//   }
// };
export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = req.body;

    let user;
    let role;

    // Check Admin first (requires password)
    user = await prisma.admin.findUnique({ where: { username } });
    if (user) {
      role = "ADMIN";
      if (!password) {
        res.status(400).json({ error: "Password required for admin" });
        return;
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
    }

    // For Teacher, Student, and Parent (no password required)
    if (!user) {
      user = await prisma.teacher.findUnique({ where: { username } });
      if (user) role = "TEACHER";
    }
    if (!user) {
      user = await prisma.student.findUnique({ where: { username } });
      if (user) role = "STUDENT";
    }
    if (!user) {
      user = await prisma.parent.findUnique({ where: { username } });
      if (user) role = "PARENT";
    }

    // If no user is found
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Generate JWT token for all users
    const token = jwt.sign({ id: user.id, role }, SECRET_KEY, {
      expiresIn: "2h",
    });

    res.status(200).json({ message: "Login successful", token, role });
    return;
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
    return;
  }
};
