import express from 'express';
import { createAttendance ,getAllAttendance,getAllAttendanceByClass,getAllAttendanceByClassStats } from "../controllers/AttendController"
const router = express.Router();

router.post('/', createAttendance);
router.get('/', getAllAttendance);
router.get('/class', getAllAttendanceByClass);
router.get('/stat', getAllAttendanceByClassStats);
export default router;
