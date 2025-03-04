import { Router } from "express";
import {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
} from "../controllers/TeachersControllers";

const router = Router();

router.post("/", createTeacher);
router.get("/", getTeachers);
// router.get("/teachers/:id", getTeacherById);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;
