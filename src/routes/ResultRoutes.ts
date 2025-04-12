import { Router } from 'express';
import {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getResultsByStudentId
} from '../controllers/ResultController';

const router = Router();

router.post('/', createResult);
router.get('/', getAllResults);
router.get('/:id', getResultById);
router.get('/studentid/:id', getResultsByStudentId);
router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
