"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EventsController_1 = require("../controllers/EventsController");
const router = (0, express_1.Router)();
router.post("/", EventsController_1.createEvent);
router.get("/", EventsController_1.getAllEvents);
exports.default = router;
