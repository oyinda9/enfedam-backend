import path from "path";

import express, { Request, Response } from "express";
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
const port = 5000;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Use student routes
app.use("/students", StudentRoutes);
app.use("/parents", ParentRoutes);
app.use("/admin", AdminRoutes);
app.use("/teachers", TeacherRoutes);
app.use("/lesson", LessonRoutes);
app.use("/results", ResultRoutes);
app.use("/class", ClassRoute);
app.use("/events", EventsRoutes);
app.use("/subject", subjectRoute);
app.use("/attendance", attendRoute);
app.use("/exam", ExamRoutes);
app.use("/payment", PaymentRoute);
app.use("/report", reportRoute);
app.use("/sections", SectionRoutes);
app.use("/gallery", GalleryRoute);
app.use("/auth", AuthRoutes);

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("School Management System Backend is running!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
