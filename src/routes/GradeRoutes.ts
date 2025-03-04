import express from "express";
import {createGrade,updateGrade,deleteGrade,getGradeById} from '../controllers/GradeController'

const router = express.Router();

router.post("/", createGrade);
router.put("/:id", updateGrade);
// router.get('/:id', getGradeById);
router.delete("/:id", deleteGrade);
export default router;
