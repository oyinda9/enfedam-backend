import { Router } from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignClassesAndSubjectsToTeacher
} from "../controllers/TeachersControllers";
import {
  authenticateAdmin,
  authorizeAdmin,
  authorizeTeacherCreation
} from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateAdmin, authorizeAdmin, authorizeTeacherCreation, createTeacher );
router.get("/", getTeachers , authenticateAdmin, authorizeAdmin, authorizeTeacherCreation,);
router.get("/:id", getTeacherById, authenticateAdmin, authorizeAdmin);
router.post("/assign-classes-subjects", authenticateAdmin, authorizeAdmin, authorizeTeacherCreation, assignClassesAndSubjectsToTeacher );
router.put("/:id", authenticateAdmin, authorizeAdmin, authorizeTeacherCreation, updateTeacher);
router.delete("/:id", authenticateAdmin, authorizeAdmin, authorizeTeacherCreation, deleteTeacher);

export default router;
