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
exports.createResult = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { score, examId, assignmentId, studentId } = req.body;
        const result = yield prisma.result.create({ data: { score, examId, assignmentId, studentId } });
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create result' });
    }
});
exports.createResult = createResult;
