import express from 'express';
import { createAttendance } from "../controllers/attendanceController"
const router = express.Router();

router.post('/attendance', createAttendance); // ✅ Uses your real controller function

export default router;
