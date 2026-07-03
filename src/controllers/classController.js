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
exports.ClassController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ClassController {
    // ✅ Create a new class
    static createClass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, capacity, supervisorId } = req.body;
                if (!name || !capacity) {
                    res.status(400).json({ error: "Name and capacity are required" });
                    return;
                }
                let supervisorData = {};
                if (supervisorId) {
                    const supervisorExists = yield prisma.teacher.findUnique({
                        where: { id: supervisorId },
                    });
                    if (!supervisorExists) {
                        res.status(400).json({ error: "Supervisor not found" });
                        return;
                    }
                    supervisorData = { supervisor: { connect: { id: supervisorId } } };
                }
                const newClass = yield prisma.class.create({
                    data: Object.assign({ name,
                        capacity }, supervisorData), // Ensuring correct Prisma type
                });
                res.status(201).json({ message: "Class created successfully", newClass });
            }
            catch (error) {
                console.error("Error creating class:", error);
                res.status(500).json({ error: "Error creating class", details: error instanceof Error ? error.message : "Unknown error" });
            }
        });
    }
    // ✅ Get all classes
    static getAllClasses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const classes = yield prisma.class.findMany({
                    include: {
                        supervisor: true,
                        students: true,
                        announcements: true,
                        lessons: true,
                    },
                });
                res.status(200).json(classes);
            }
            catch (error) {
                console.error("Error fetching classes:", error);
                res.status(500).json({ error: "Error fetching classes", details: error instanceof Error ? error.message : "Unknown error" });
            }
        });
    }
    // ✅ Get a single class by ID
    static getClassById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const classData = yield prisma.class.findUnique({
                    where: { id: parseInt(id) },
                    include: {
                        supervisor: true,
                        students: true,
                        announcements: true,
                        lessons: true,
                    },
                });
                if (!classData) {
                    res.status(404).json({ error: "Class not found" });
                    return;
                }
                res.status(200).json(classData);
            }
            catch (error) {
                console.error("Error fetching class:", error);
                res.status(500).json({ error: "Error fetching class", details: error instanceof Error ? error.message : "Unknown error" });
            }
        });
    }
    // ✅ Update a class
    static updateClass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { name, capacity, supervisorId } = req.body;
                let supervisorData = {};
                if (supervisorId) {
                    const supervisorExists = yield prisma.teacher.findUnique({
                        where: { id: supervisorId },
                    });
                    if (!supervisorExists) {
                        res.status(400).json({ error: "Supervisor not found" });
                        return;
                    }
                    supervisorData = { supervisor: { connect: { id: supervisorId } } };
                }
                const updatedClass = yield prisma.class.update({
                    where: { id: parseInt(id) },
                    data: Object.assign({ name,
                        capacity }, supervisorData),
                });
                res.status(200).json({ message: "Class updated successfully", updatedClass });
            }
            catch (error) {
                console.error("Error updating class:", error);
                res.status(500).json({ error: "Error updating class", details: error instanceof Error ? error.message : "Unknown error" });
            }
        });
    }
    // ✅ Delete a class
    static deleteClass(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield prisma.class.delete({
                    where: { id: parseInt(id) },
                });
                res.status(200).json({ message: "Class deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting class:", error);
                res.status(500).json({ error: "Error deleting class", details: error instanceof Error ? error.message : "Unknown error" });
            }
        });
    }
}
exports.ClassController = ClassController;
