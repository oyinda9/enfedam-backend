import { Router } from 'express';
import {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getResultsByStudentId,getOneStudentsCummulatedResults
,getAllStudentsCummulatedResults} from '../controllers/ResultController';

const router = Router();

router.post('/', createResult);
router.get('/', getAllResults);
router.get('/:id', getResultById);
// For ALL students' cumulative results
router.get('/results/all', getAllStudentsCummulatedResults); // More specific, for ALL
router.get('/results/:id', getOneStudentsCummulatedResults); // Specific student

router.get('/studentid/:id', getResultsByStudentId);


router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
