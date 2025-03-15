import express from "express";
import {loginAdmin, registerAdmin, loginUser } from "../controllers/authController";

const router = express.Router();

// Define routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/loginUser", loginUser);

export default  router ;