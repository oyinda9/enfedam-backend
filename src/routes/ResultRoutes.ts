import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getResultsByStudentId,getOneStudentsCummulatedResults
,getAllStudentsCummulatedResults} from '../controllers/ResultController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();
const staffOnly = requireRole(Role.ADMIN, Role.TEACHER);

router.post('/', authenticate, staffOnly, createResult);
router.get('/', getAllResults);

// Static/multi-segment routes must come before '/:id' or Express matches '/:id' first.
router.get('/all', getAllStudentsCummulatedResults); // GET /results/all - cumulative for ALL students
router.get('/cumulative/:id', getOneStudentsCummulatedResults); // GET /results/cumulative/:id - cumulative for ONE student
router.get('/studentid/:id', getResultsByStudentId);

router.get('/:id', getResultById);
router.put('/:id', authenticate, staffOnly, updateResult);
router.delete('/:id', authenticate, staffOnly, deleteResult);

export default router;
