import { Router } from "express";
import { ClassController } from "../controllers/classController";

const router = Router();

// ✅ Create a new class
router.post("/classes", ClassController.createClass);

// ✅ Get all classes
router.get("/classes", ClassController.getAllClasses);

// ✅ Get a single class by ID
router.get("/classes/:id", ClassController.getClassById);

// ✅ Update a class by ID
router.put("/classes/:id", ClassController.updateClass);

// ✅ Delete a class by ID
router.delete("/classes/:id", ClassController.deleteClass);

export default router;
