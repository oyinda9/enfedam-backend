import express from 'express';
import { getFullReport } from '../controllers/reportController';

const router = express.Router();

// GET full detailed report of students, parents, classes, teachers, and payments
router.get('/full', getFullReport);

export default router;
