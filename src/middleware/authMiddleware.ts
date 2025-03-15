import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "your_default_secret";

// ✅ Extend Request to Include `user`
export interface AuthRequest extends Request {
  admin?: { id: string; role: string };
}

// 🛡️ Middleware to Verify JWT Token
export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; role: string };
    req.admin = decoded; // Attach user data
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// 🔐 Ensure Only Admin Can Register Users
export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.admin || req.admin.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden: Only Admins can access this" });
  }
  next();
};
