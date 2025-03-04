import { Router } from "express"
import {createEvent,} from "../controllers/EventsController"
const router = Router();
router.post("/",createEvent)


export default router