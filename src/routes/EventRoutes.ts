import { Router } from "express"
import {createEvent,getAllEvents,updateEvent,deleteEvent} from "../controllers/EventsController"
const router = Router();
router.post("/",createEvent)
router.get("/",getAllEvents)
router.put("/:id",updateEvent)
router.delete("/:id",deleteEvent)

export default router