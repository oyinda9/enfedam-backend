import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/authController";

const router = express.Router();

// Define routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

export default  router ;