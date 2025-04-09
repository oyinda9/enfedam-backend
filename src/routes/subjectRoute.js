"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SubjectControllers_1 = require("../controllers/SubjectControllers");
const router = express_1.default.Router();
router.post("/", SubjectControllers_1.createSubject);
router.get("/", SubjectControllers_1.getAllSubjects);
exports.default = router;
