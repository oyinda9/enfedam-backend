import express from 'express';
import { createAttendance } from "../controllers/AttendController"
const router = express.Router();

router.post('/', createAttendance);

export default router;
