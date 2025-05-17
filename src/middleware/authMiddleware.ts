import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {  Role } from '@prisma/client'

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Extend Request to Include `user` information (id, role, etc.)
export interface AuthRequest extends Request {
  user?: { id: string; role: Role };  // Use the Role enum for the role type
}

// Middleware to verify the JWT and extract user information
export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract the token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ error: "Access denied. No token provided." });
      return;
    }

    // Verify the token and decode the user info
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; role: string };

    // Ensure the token contains valid user info
    if (!decoded.id || !decoded.role) {
      res.status(400).json({ error: "Invalid token payload" });
      return;
    }

    // Cast the role to Role enum explicitly
    req.user = {
      id: decoded.id,
      role: decoded.role as Role,  // Explicitly cast the role to Role enum
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    res.status(500).json({ error: "Authentication failed" });
    return;
  }
};

// Middleware to check if the user is an admin and allow access accordingly
export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Check if the logged-in user's role is 'ADMIN'
  if (req.user?.role !== Role.ADMIN) {
     res.status(403).json({ error: "Forbidden. You do not have permission to perform this action." });
     return;
  }

  // If authorized (user is admin), proceed to the next middleware or route handler
  next();
};

// Middleware to prevent a parent (USER role) from creating another parent
export const authorizeParentCreation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if the logged-in user is a parent (USER role)
  if (req.user?.role === Role.USER) {
     res.status(403).json({ error: "Unauthorized: You are not allowed to create a parent." });
     return
  }

  // If not a parent (they may be an admin or other authorized role), proceed
  next();
};

export const authorizeTeacherCreation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if the logged-in user is a parent (USER role)
  if (req.user?.role === Role.TEACHER) {
     res.status(403).json({ error: "Unauthorized: You are not allowed to create a TEACHER." });
     return
  }

  // If not a parent (they may be an admin or other authorized role), proceed
  next();
};

export const authorizesStudentCreation = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Check if the logged-in user is a parent (USER role)
  if (req.user?.role === Role.STUDENT) {
     res.status(403).json({ error: "Unauthorized: You are not allowed to create a student." });
     return
  }

  // If not a parent (they may be an admin or other authorized role), proceed
  next();
};