import express from "express";
import { createSubject, getAllSubjects, getSubjectById, deleteSubject } from "../controllers/SubjectControllers";

const router = express.Router();

router.post("/", createSubject);

router.get("/", getAllSubjects);

router.get("/:id", getSubjectById);

router.delete("/:id", deleteSubject);

export default router;
