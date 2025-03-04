"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClassController_1 = require("../controllers/ClassController");
const router = (0, express_1.Router)();
router.post("/", ClassController_1.getAllClasses);
router.post("/", ClassController_1.createClass);
// router.post("/:id",getclassesById)
router.post("/:id", ClassController_1.updateClass);
router.post("/:id", ClassController_1.deleteClass);
exports.default = router;
