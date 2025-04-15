import { Router } from 'express';
import {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getResultsByStudentId,getResultsByStudentIds
,getAllStudentsResults} from '../controllers/ResultController';

const router = Router();

router.post('/', createResult);
router.get('/', getAllResults);
router.get('/:id', getResultById);
router.get('/student/',getAllStudentsResults)
router.get('/studentid/:id', getResultsByStudentId);
router.get('/student/:id', getResultsByStudentIds);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
