import express from "express";
import { createSubject } from "../controllers/SubjectControllers"; 

const router = express.Router();

router.post("/", createSubject);

export default router;
