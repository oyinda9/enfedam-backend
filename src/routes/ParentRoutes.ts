import express from "express";
import {
  createParent,
  getAllParents,
  updateParent,
  deleteParent,
  getParentById
} from "../controllers/ParentController";
import {
  authenticateAdmin,
  authorizeAdmin,
  authorizeParentCreation
} from "../middleware/authMiddleware";

const router = express.Router();

// Apply middleware to routes
router.post("/", authenticateAdmin, authorizeAdmin, authorizeParentCreation,createParent); // Only admins can create parents
router.get("/", getAllParents); // Public route (no authentication required)
router.get("/:id", getParentById); // Public route (no authentication required)
router.put("/:id", authenticateAdmin, authorizeAdmin, updateParent); // Only admins can update parents
router.delete("/:id", authenticateAdmin, authorizeAdmin, deleteParent); // Only admins can delete parents

export default router;
