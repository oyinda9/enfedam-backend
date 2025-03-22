"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClassController_1 = require("../controllers/ClassController");
const router = (0, express_1.Router)();
router.get("/", ClassController_1.getAllClasses);
router.post("/", ClassController_1.createClass);
// router.get("/:id", getClassById); // Corrected method from POST to GET
router.put("/:id", ClassController_1.updateClass); // Changed from POST to PUT for updates
router.delete("/:id", ClassController_1.deleteClass); // Changed from POST to DELETE for deletions
exports.default = router;
