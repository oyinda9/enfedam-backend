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
router.get('/cummulativestudents', getAllStudentsCummulatedResults);

// For ONE student's cumulative results
router.get('/cummulativestudent/:id', getOneStudentsCummulatedResults);
router.get('/studentid/:id', getResultsByStudentId);


router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
