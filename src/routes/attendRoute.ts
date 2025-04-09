import express from 'express';
import { createAttendance } from "../controllers/attendanceController"
const router = express.Router();

router.post('/attendance', createAttendance);

export default router;
