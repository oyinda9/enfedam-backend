import { Router } from "express";
import { createAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin } from "../controllers/AdminControllers";


const router = Router();

router.post("/", createAdmin);
router.get("/", getAllAdmins);
// router.get("/admins/:id", getAdminById);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
