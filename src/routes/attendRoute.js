"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendanceController_1 = require("../controllers/AttendController"); // Make sure this path is correct
const router = express_1.default.Router();
router.post('/', attendanceController_1.createAttendance); // ✅ Uses your real controller function
exports.default = router;
