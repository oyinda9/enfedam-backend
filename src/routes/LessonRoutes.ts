import express from 'express';
import {createLesson} from '../controllers/LessonController'
const router = express.Router();
router.post("/",createLesson)
export default router;