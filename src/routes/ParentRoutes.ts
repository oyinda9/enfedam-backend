import express from "express";
import { createParent, getAllParents, getParentById, updateParent, deleteParent  } from "../controllers/ParentController";

const router = express.Router();

router.post("/", createParent);
router.get("/", getAllParents);
// router.get("/:id", getParentById);
router.put("/:id", updateParent);
router.delete("/:id", deleteParent);

export default router;
