import express from "express";
import { Router } from "express";
import { createResult } from "../controllers/ResultController";
const router = express.Router();
router.post("/", createResult);

export default router;
