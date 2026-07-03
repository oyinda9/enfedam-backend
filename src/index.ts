import path from "path";

import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
require("dotenv").config();
import StudentRoutes from "./routes/StudentRoutes";
import ParentRoutes from "./routes/ParentRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import TeacherRoutes from "./routes/TeacherRoutes";
import LessonRoutes from "./routes/LessonRoutes";
import ResultRoutes from "./routes/ResultRoutes";
import ClassRoute from "./routes/ClassRoute";
import EventsRoutes from "./routes/EventRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import subjectRoute from "./routes/subjectRoute";
import attendRoute from "./routes/attendRoute";
import ExamRoutes from "./routes/ExamRoutes";
import PaymentRoute from "./routes/PaymentRoute";
import reportRoute from "./routes/reportRoute";
import SectionRoutes from "./routes/SectionRoute";
import GalleryRoute from "./routes/GalleryRoute"

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5005;

// CORS Configuration - Enhanced for security
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Body Parser Middleware with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Security Headers (manual implementation without helmet for now)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  next();
});

// Simple Rate Limiting (without express-rate-limit for now)
const requestCounts = new Map<string, number[]>();
app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip)!;
  const recentRequests = requests.filter((time) => time > now - windowMs);

  if (recentRequests.length >= maxRequests) {
    res.status(429).json({
      error: "Too many requests from this IP, please try again later.",
    });
    return;
  }

  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  next();
});

// Request Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/system_images", express.static(path.join(__dirname, "../system_images")));

// API Routes with v1 prefix
const apiPrefix = "/api/v1";
app.use(`${apiPrefix}/auth`, AuthRoutes);
app.use(`${apiPrefix}/students`, StudentRoutes);
app.use(`${apiPrefix}/parents`, ParentRoutes);
app.use(`${apiPrefix}/admin`, AdminRoutes);
app.use(`${apiPrefix}/teachers`, TeacherRoutes);
app.use(`${apiPrefix}/lesson`, LessonRoutes);
app.use(`${apiPrefix}/results`, ResultRoutes);
app.use(`${apiPrefix}/class`, ClassRoute);
app.use(`${apiPrefix}/events`, EventsRoutes);
app.use(`${apiPrefix}/subject`, subjectRoute);
app.use(`${apiPrefix}/attendance`, attendRoute);
app.use(`${apiPrefix}/exam`, ExamRoutes);
app.use(`${apiPrefix}/payment`, PaymentRoute);
app.use(`${apiPrefix}/report`, reportRoute);
app.use(`${apiPrefix}/sections`, SectionRoutes);
app.use(`${apiPrefix}/gallery`, GalleryRoute);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "School Management System Backend is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Health check for monitoring
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Prisma errors
  if (err.code && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        statusCode: 409,
        message: `Unique constraint violation`,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Record not found",
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // Default error
  res.status(500).json({
    success: false,
    statusCode: 500,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    timestamp: new Date().toISOString(),
  });
};

app.use(errorHandler as any);

// Start the server
app.listen(port, () => {
  console.log(`\n🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API available at http://localhost:${port}/api/v1`);
  console.log(`🏥 Health check at http://localhost:${port}/health\n`);
});
