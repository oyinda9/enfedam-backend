import { Router } from "express";
import { ClassController } from "../controllers/ClassController";

const router = Router();

router.post("/classes", ClassController.createClass);
router.get("/classes", ClassController.getAllClasses);
router.get("/classes/:id", ClassController.getClassById);
router.put("/classes/:id", ClassController.updateClass);
router.delete("/classes/:id", ClassController.deleteClass);

export default router;
