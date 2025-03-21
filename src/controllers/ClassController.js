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
exports.deleteClass = exports.updateClass = exports.getclassesById = exports.getAllClasses = exports.createClass = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new class
const createClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, capacity, supervisorId } = req.body;
        // Check if class name already exists
        const existingClass = yield prisma.class.findUnique({
            where: { name },
        });
        if (existingClass) {
            res.status(400).json({ error: "Class with this name already exists" });
            return;
        }
        // Create the class
        const newClass = yield prisma.class.create({
            data: {
                name,
                capacity,
                supervisor: supervisorId
                    ? { connect: { id: supervisorId } }
                    : undefined,
            },
            include: {
                supervisor: true,
            },
        });
        res.status(201).json(newClass);
    }
    catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ error: "Failed to create class" });
    }
});
exports.createClass = createClass;
//get all classes
const getAllClasses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classes = yield prisma.class.findMany({
            include: {
                supervisor: true,
                lessons: true,
                students: true,
                events: true,
                announcements: true,
            },
        });
        res.json(classes);
    }
    catch (error) {
        res.status(500).json({ error: "failed to fetch students" });
    }
});
exports.getAllClasses = getAllClasses;
// Get a classes by ID
const getclassesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const classId = Number(id);
    try {
        const classes = yield prisma.class.findUnique({
            where: { id: classId },
            include: {
                supervisor: true,
                lessons: true,
                students: true,
                events: true,
                announcements: true,
            },
        });
        if (!classes) {
            return res.status(404).json({ error: "classes not found" });
        }
        res.json(classes);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});
exports.getclassesById = getclassesById;
//update a class
const updateClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const classId = Number(id);
        const updatedClass = yield prisma.class.update({
            where: { id: classId },
            data: req.body,
        });
        res.status(200).json(updatedClass);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update teacher" });
    }
});
exports.updateClass = updateClass;
// Delete a class
const deleteClass = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.teacher.delete({ where: { id } });
        res.status(200).json({ message: "Class deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete Class" });
    }
});
exports.deleteClass = deleteClass;
