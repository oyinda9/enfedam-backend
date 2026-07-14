import express from "express";
import { createSubject ,getAllSubjects, deleteSubject } from "../controllers/SubjectControllers";

const router = express.Router();

router.post("/", createSubject);

router.get("/", getAllSubjects);

router.delete("/:id", deleteSubject);

export default router;
