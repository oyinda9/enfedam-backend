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
router.get('/cummulativestudent', getOneStudentsCummulatedResults);

router.get('/studentid/:id', getResultsByStudentId);
router.get('/CummulativeStudent/:id', getAllStudentsCummulatedResults);

router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
