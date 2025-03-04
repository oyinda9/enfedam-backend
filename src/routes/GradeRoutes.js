"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GradeController_1 = require("../controllers/GradeController");
const router = express_1.default.Router();
router.post("/", GradeController_1.createGrade);
router.put("/:id", GradeController_1.updateGrade);
// router.get('/:id', getGradeById);
router.delete("/:id", GradeController_1.deleteGrade);
exports.default = router;
