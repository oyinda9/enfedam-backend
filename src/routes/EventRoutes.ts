import { Router } from "express"
import {createEvent,getAllEvents} from "../controllers/EventsController"
const router = Router();
router.post("/",createEvent)
router.get("/",getAllEvents)


export default router