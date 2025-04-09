import express from 'express';
import { createAttendance ,getAllAttendance } from "../controllers/AttendController"
const router = express.Router();

router.post('/', createAttendance);
router.get('/', getAllAttendance);

export default router;
