"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SectionController_1 = require("../controllers/SectionController");
const router = express_1.default.Router();
router.get("/", SectionController_1.getSections);
router.get("/:id", SectionController_1.getSectionById);
router.post("/", SectionController_1.createSection);
router.put("/:id", SectionController_1.updateSection);
router.delete("/:id", SectionController_1.deleteSection);
// Add this to sectionRoutes.js
router.get("/:id/stats", SectionController_1.getSectionStats);
exports.default = router;
