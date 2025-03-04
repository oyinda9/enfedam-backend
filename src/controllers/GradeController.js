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
exports.deleteGrade = exports.updateGrade = exports.getGradeById = exports.getAllGrades = exports.createGrade = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 🟢 Create a new grade
const createGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { level } = req.body;
    try {
        const grade = yield prisma.grade.create({
            data: { level },
        });
        res.status(201).json(grade);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create grade" });
    }
});
exports.createGrade = createGrade;
const getAllGrades = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const grades = yield prisma.grade.findMany({
            include: { students: true, classess: true }, // Include related data
        });
        res.status(200).json(grades);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch grades" });
    }
});
exports.getAllGrades = getAllGrades;
const getGradeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const grade = yield prisma.grade.findUnique({
            where: { id: Number(id) },
            include: { students: true, classess: true },
        });
        if (!grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }
        res.status(200).json(grade);
    }
    catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Failed to fetch grade' });
    }
});
exports.getGradeById = getGradeById;
const updateGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { level } = req.body;
    try {
        const grade = yield prisma.grade.update({
            where: { id: Number(id) },
            data: { level },
        });
        res.status(200).json(grade);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update grade" });
    }
});
exports.updateGrade = updateGrade;
const deleteGrade = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.grade.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Grade deleted successfully" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete grade" });
    }
});
exports.deleteGrade = deleteGrade;
