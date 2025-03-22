import { Router } from "express";
import {
  getAllClasses,
  createClass,
//   getClassById, // Renamed to follow camelCase convention
  updateClass,
  deleteClass
} from "../controllers/ClassController";

const router = Router();

router.get("/", getAllClasses);
router.post("/", createClass);
// router.get("/:id", getClassById); // Corrected method from POST to GET
router.put("/:id", updateClass);  // Changed from POST to PUT for updates
router.delete("/:id", deleteClass); // Changed from POST to DELETE for deletions

export default router;
