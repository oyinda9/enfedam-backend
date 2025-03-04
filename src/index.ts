import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import StudentRoutes from "./routes/StudentRoutes";
import ParentRoutes from "./routes/ParentRoutes";
import GradeRoutes from "./routes/GradeRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import TeacherRoutes from "./routes/TeacherRoutes";
import LessonRoutes from "./routes/LessonRoutes";
import ResultRoutes from "./routes/ResultRoutes";
import ClassRoutes from "./routes/ClassRoute";
import EventsRoutes from "./routes/EventRoutes";

const prisma = new PrismaClient();
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

// Use student routes
app.use("/students", StudentRoutes);
app.use("/parents", ParentRoutes);
app.use("/grade", GradeRoutes);
app.use("/admins", AdminRoutes);
app.use("/teacher", TeacherRoutes);
app.use("/lesson", LessonRoutes);
app.use("/results", ResultRoutes);
app.use("/class", ClassRoutes);
app.use("/events", EventsRoutes);
// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("School Management System Backend is running!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
