import express from 'express';
import { createAttendance ,getAllAttendance,getAllAttendanceByClass } from "../controllers/AttendController"
const router = express.Router();

router.post('/', createAttendance);
router.get('/', getAllAttendance);
router.get('/class', getAllAttendanceByClass);

export default router;
