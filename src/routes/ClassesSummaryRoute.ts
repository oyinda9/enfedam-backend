import { Router } from "express";
import { ClassController } from "../controllers/classController";

const router = Router();

router.get("/", ClassController.getClassesSummary);

export default router;
