import { Router } from "express"
import {getAllClasses,createClass,getclassesById,updateClass,deleteClass} from "../controllers/ClassController"
const router = Router();
router.get("/",getAllClasses)
router.post("/",createClass)
// router.post("/:id",getclassesById)
router.post("/:id",updateClass)
router.post("/:id",deleteClass)

export default router