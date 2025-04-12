import express from 'express'
import {
  createExam,
  addExamScore,
  getAllExamsWithScores,
} from '../controllers/ExamsController'

const router = express.Router()

router.post('/create', createExam)
router.post('/score', addExamScore)
router.get('/all', getAllExamsWithScores)

export default router
