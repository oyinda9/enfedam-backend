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
// Get cumulative results for ALL students
router.get('/cummulativestudent', getAllStudentsCummulatedResults);

// Get cumulative results for ONE specific student
router.get('/cummulativestudent/:id', getOneStudentsCummulatedResults);
router.get('/studentid/:id', getResultsByStudentId);


router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
