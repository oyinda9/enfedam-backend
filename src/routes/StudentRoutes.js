"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StudentController_1 = require("../controllers/StudentController");
const router = express_1.default.Router();
// Student routes
router.get('/', StudentController_1.getAllStudents);
// router.get('/:id', getStudentById);
router.post('/', StudentController_1.createStudent);
router.put('/:id', StudentController_1.updateStudent);
router.delete('/:id', StudentController_1.deleteStudent);
exports.default = router;
