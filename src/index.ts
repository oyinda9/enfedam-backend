import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
require('dotenv').config();
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

const prisma = new PrismaClient();
const app = express();
const port = 5003;
app.use(cors());
app.use(express.json());

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

app.use("/auth", AuthRoutes);
// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.send("School Management System Backend is running!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
