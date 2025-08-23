import express from "express";
import {
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getSectionStats
} from "../controllers/SectionController";

const router = express.Router();

router.get("/", getSections);
router.get("/:id", getSectionById);
router.post("/", createSection);
router.put("/:id", updateSection);
router.delete("/:id", deleteSection);
// Add this to sectionRoutes.js
router.get("/:id/stats", getSectionStats);


export default router;
