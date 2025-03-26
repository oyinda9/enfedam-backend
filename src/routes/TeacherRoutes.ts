import { Router } from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
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
router.put("/:id", authenticateAdmin, authorizeAdmin, authorizeTeacherCreation, updateTeacher);
router.delete("/:id", authenticateAdmin, authorizeAdmin, authorizeTeacherCreation, deleteTeacher);

export default router;
