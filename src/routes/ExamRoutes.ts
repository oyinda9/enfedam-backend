import express from 'express'
import {
    createExamScore,
    getExamScoreById,
    getAllExamScores

} from '../controllers/ExamsController'

const router = express.Router()

router.post('/create', createExamScore)
router.post('/score', getExamScoreById)
router.get('/all', getAllExamScores)

export default router
