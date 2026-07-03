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
exports.getSectionStats = exports.deleteSection = exports.updateSection = exports.createSection = exports.getSectionById = exports.getSections = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ✅ Get all sections (with or without classes)
const getSections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sections = yield prisma.section.findMany({
            include: { classes: true }, // remove if you only want sections
        });
        res.json(sections);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to fetch sections", details: error.message });
    }
});
exports.getSections = getSections;
// ✅ Get a single section by id
const getSectionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid section id" });
            return;
        }
        const section = yield prisma.section.findUnique({
            where: { id },
            include: { classes: true },
        });
        if (!section) {
            res.status(404).json({ error: "Section not found" });
            return;
        }
        res.json(section);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to fetch section", details: error.message });
    }
});
exports.getSectionById = getSectionById;
// ✅ Create a new section
const createSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: "Section name is required" });
            return;
        }
        const section = yield prisma.section.create({
            data: { name },
        });
        res.status(201).json(section);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to create section", details: error.message });
    }
});
exports.createSection = createSection;
// ✅ Update a section
const updateSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid section id" });
            return;
        }
        const { name } = req.body;
        const section = yield prisma.section.update({
            where: { id },
            data: { name },
        });
        res.json(section);
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to update section", details: error.message });
    }
});
exports.updateSection = updateSection;
// ✅ Delete a section
const deleteSection = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid section id" });
            return;
        }
        yield prisma.section.delete({
            where: { id },
        });
        res.json({ message: "Section deleted successfully" });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Failed to delete section", details: error.message });
    }
});
exports.deleteSection = deleteSection;
// ✅ Get statistics for a section
const getSectionStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sectionId = parseInt(req.params.id, 10);
        if (isNaN(sectionId)) {
            res.status(400).json({ error: "Invalid section id" });
            return;
        }
        const section = yield prisma.section.findUnique({
            where: { id: sectionId },
            include: {
                classes: {
                    include: {
                        students: true,
                        subjects: true,
                        lessons: true,
                        announcements: true,
                    },
                },
            },
        });
        if (!section) {
            res.status(404).json({ error: "Section not found" });
            return;
        }
        const totalClasses = section.classes.length;
        const totalStudents = section.classes.reduce((sum, cls) => {
            return sum + cls.students.length;
        }, 0);
        const totalSubjects = section.classes.reduce((sum, cls) => {
            return sum + cls.subjects.length;
        }, 0);
        const totalLessons = section.classes.reduce((sum, cls) => {
            return sum + cls.lessons.length;
        }, 0);
        const totalAnnouncements = section.classes.reduce((sum, cls) => {
            return sum + cls.announcements.length;
        }, 0);
        res.json({
            section: section.name,
            totals: {
                totalClasses,
                totalStudents,
                totalSubjects,
                totalLessons,
                totalAnnouncements,
            },
            classes: section.classes.map((cls) => ({
                id: cls.id,
                name: cls.name,
                students: cls.students.length,
                subjects: cls.subjects.length,
                lessons: cls.lessons.length,
                announcements: cls.announcements.length,
            })),
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Failed to fetch section stats", details: error.message });
    }
});
exports.getSectionStats = getSectionStats;
