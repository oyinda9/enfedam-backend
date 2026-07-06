import express from "express";
import {login, registerAdmin, registerExecutive, refreshAccessToken } from "../controllers/authController";

const router = express.Router();

// Define routes
router.post("/register", registerAdmin);
router.post("/register/executive", registerExecutive); // <-- changed this line
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
// router.post("/loginUser", loginUser);

export default  router ;