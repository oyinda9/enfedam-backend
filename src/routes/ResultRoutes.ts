import { Router } from 'express';
import {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getResultsByStudentId,getCummulatedResultsByStudentIds
,getAllStudentsCummulatedResults} from '../controllers/ResultController';

const router = Router();

router.post('/', createResult);
router.get('/', getAllResults);
router.get('/:id', getResultById);
router.get('/student/',getAllStudentsCummulatedResults)
router.get('/studentid/:id', getResultsByStudentId);
router.get('/student/:id', getCummulatedResultsByStudentIds);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
