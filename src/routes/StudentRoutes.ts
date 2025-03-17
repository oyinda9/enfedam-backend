import express from "express";
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
} from "../middleware/authMiddleware";

const router = express.Router();

// Student routes
router.get("/", getAllStudents);
// router.get('/:id', getStudentById);
router.post(
  "/",
  authenticateAdmin,
  authorizeAdmin,
  authorizesStudentCreation,
  createStudent
);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
