import express from "express";
import { Role } from "@prisma/client";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/StudentController";
import {
  authenticateAdmin,
  authorizeAdmin,
  authorizesStudentCreation,
  authenticate,
  requireRole,
  requireSelfOrRoles,
} from "../middleware/authMiddleware";
import { getStudentTranscripts, createTranscript } from "../controllers/TranscriptController";
import { getStudentTestimonials, createTestimonial } from "../controllers/TestimonialController";
import { getStudentConduct, createConductRecord } from "../controllers/ConductController";
import { getStudentAchievements, createAchievement } from "../controllers/AchievementController";
import { getStudentAttendance } from "../controllers/AttendController";

const router = express.Router();

// Student routes
router.get("/", getAllStudents);
router.get("/:id" , getStudentById);
router.post(
  "/",
  authenticateAdmin,
  authorizeAdmin,
  authorizesStudentCreation,
  createStudent
);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

// Student Records sub-resources
const staffOnly = requireRole(Role.ADMIN, Role.TEACHER);
const readAccess = requireSelfOrRoles(Role.ADMIN, Role.TEACHER);

router.get("/:studentId/transcripts", authenticate, readAccess, getStudentTranscripts);
router.post("/:studentId/transcripts", authenticate, staffOnly, createTranscript);

router.get("/:studentId/testimonials", authenticate, readAccess, getStudentTestimonials);
router.post("/:studentId/testimonials", authenticate, staffOnly, createTestimonial);

router.get("/:studentId/conduct", authenticate, readAccess, getStudentConduct);
router.post("/:studentId/conduct", authenticate, staffOnly, createConductRecord);

router.get("/:studentId/attendance", authenticate, readAccess, getStudentAttendance);

router.get("/:studentId/achievements", authenticate, readAccess, getStudentAchievements);
router.post("/:studentId/achievements", authenticate, staffOnly, createAchievement);

export default router;
