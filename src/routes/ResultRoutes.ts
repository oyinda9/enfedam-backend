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

// Static/multi-segment routes must come before '/:id' or Express matches '/:id' first.
router.get('/all', getAllStudentsCummulatedResults); // GET /results/all - cumulative for ALL students
router.get('/cumulative/:id', getOneStudentsCummulatedResults); // GET /results/cumulative/:id - cumulative for ONE student
router.get('/studentid/:id', getResultsByStudentId);

router.get('/:id', getResultById);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
