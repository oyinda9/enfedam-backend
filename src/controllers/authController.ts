import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";
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


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password, surname } = req.body;

    // Ensure that identifier (either username or email) is provided
    if (!identifier) {
      res.status(400).json({ error: "Username or email is required" });
      return;
    }

    let user: any;
    let role: Role | undefined;

    // For Admins, we check the username only
    if (!identifier.includes("@")) {
      // Login using username for Admins only
      user = await prisma.admin.findUnique({ where: { username: identifier } });
      if (user) {
        role = Role.ADMIN; // Assign role for admin
      }
    } else {
      // Login using email and surname (for non-admins)
      if (!surname) {
        res.status(400).json({ error: "Surname is required for non-admin login" });
        return;
      }

      // Check for Teacher with matching email and surname
      user = await prisma.teacher.findFirst({
        where: {
          email: identifier,
          surname: surname,
        },
      });
      if (user) {
        role = Role.TEACHER;
      }

      // Check for Student with matching email and surname
      if (!user) {
        user = await prisma.student.findFirst({
          where: {
            email: identifier,
            surname: surname,
          },
        });
        if (user) {
          role = Role.STUDENT;
        }
      }

      // Check for User with matching email and surname (Parent in this case)
      if (!user) {
        user = await prisma.parent.findFirst({
          where: {
            email: identifier,
            surname: surname,
          },
        });
        if (user) {
          role = Role.USER; // Non-admin role for parent
        }
      }
    }

    // If user is not found
    if (!user || !role) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Admins require password validation
    if (role === Role.ADMIN) {
      if (!password) {
        res.status(400).json({ error: "Password is required for admin login" });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET || "secret", {
      expiresIn: "2h",
    });

    res.status(200).json({ message: "Login successful", token, role });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
