import express from "express";
import { createSubject ,getAllSubjects } from "../controllers/SubjectControllers"; 

const router = express.Router();

router.post("/", createSubject);

router.get("/", getAllSubjects);

export default router;
