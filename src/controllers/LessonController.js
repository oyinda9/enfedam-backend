"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLessons = exports.createLesson = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ================== LESSON CONTROLLERS ==================
const createLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, day, startTime, endTime, subjectId, classId, teacherId } = req.body;
        const lesson = yield prisma.lesson.create({
            data: { name, day, startTime, endTime, subjectId, classId, teacherId },
        });
        res.status(201).json(lesson);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create lesson' });
    }
});
exports.createLesson = createLesson;
const getAllLessons = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessons = yield prisma.lesson.findMany({ include: { subject: true, class: true, teacher: true } });
        res.json(lessons);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch lessons' });
    }
});
exports.getAllLessons = getAllLessons;
