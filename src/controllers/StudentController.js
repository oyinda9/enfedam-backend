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
exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudentById = exports.getAllStudents = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get all students
const getAllStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.student.findMany({
            include: { parent: true, class: true },
        });
        res.json(students);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch students" });
    }
});
exports.getAllStudents = getAllStudents;
// Get a student by ID
const getStudentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const student = yield prisma.student.findUnique({
            where: { id },
            include: { parent: true, class: true },
        });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch student" });
    }
});
exports.getStudentById = getStudentById;
// Create a new student
const createStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, name, surname, email, phone, address, img, bloodType, sex, parentId, classId, birthday, } = req.body;
    try {
        const student = yield prisma.student.create({
            data: {
                id: crypto.randomUUID(),
                username,
                name,
                surname,
                email: email || null,
                phone: phone || null,
                address,
                img: img || null,
                bloodType,
                sex,
                birthday: new Date(birthday),
                parent: { connect: { id: parentId } },
                class: { connect: { id: classId } },
               
            },
        });
        res.status(201).json(student);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Failed to create student" });
    }
});
exports.createStudent = createStudent;
// Update a student
const updateStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { username, name, surname, email, phone, address, img, bloodType, sex, parentId, classId,  birthday, } = req.body;
    try {
        const student = yield prisma.student.update({
            where: { id },
            data: {
                username,
                name,
                surname,
                email,
                phone,
                address,
                img,
                bloodType,
                sex,
                parentId,
                classId,
              
                birthday,
            },
        });
        res.json(student);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update student" });
    }
});
exports.updateStudent = updateStudent;
// Delete a student
const deleteStudent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.student.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete student" });
    }
});
exports.deleteStudent = deleteStudent;
