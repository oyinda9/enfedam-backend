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
exports.createExam = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createExam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, startTime, endTime, lessonId } = req.body;
        const exam = yield prisma.exam.create({ data: { title, startTime, endTime, lessonId } });
        res.status(201).json(exam);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create exam' });
    }
});
exports.createExam = createExam;
