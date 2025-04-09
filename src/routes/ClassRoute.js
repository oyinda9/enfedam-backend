"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const classController_1 = require("../controllers/classController");
const router = (0, express_1.Router)();
// ✅ Create a new class
router.post("/classes", classController_1.ClassController.createClass);
// ✅ Get all classes
router.get("/classes", classController_1.ClassController.getAllClasses);
// ✅ Get a single class by ID
router.get("/classes/:id", classController_1.ClassController.getClassById);
// ✅ Update a class by ID
router.put("/classes/:id", classController_1.ClassController.updateClass);
// ✅ Delete a class by ID
router.delete("/classes/:id", classController_1.ClassController.deleteClass);
exports.default = router;
