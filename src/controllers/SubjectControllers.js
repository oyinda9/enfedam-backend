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
exports.getAllSubjects = exports.createSubject = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Create a Subject and link it to one or more Classes
 */
const createSubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, classIds } = req.body; // classIds = array of class IDs to connect
        if (!name || !Array.isArray(classIds) || classIds.length === 0) {
            res.status(400).json({ message: 'Name and at least one classId are required.' });
            return;
        }
        // Check if all classes exist
        const existingClasses = yield prisma.class.findMany({
            where: { id: { in: classIds } },
        });
        if (existingClasses.length !== classIds.length) {
            res.status(404).json({ message: 'One or more classes not found.' });
            return;
        }
        // Create the subject and connect to classes
        const createdSubject = yield prisma.subject.create({
            data: {
                name,
                classes: {
                    connect: classIds.map((id) => ({ id })),
                },
            },
            include: {
                classes: { select: { id: true, name: true } },
            },
        });
        res.status(201).json({
            message: 'Subject created successfully.',
            data: createdSubject,
        });
    }
    catch (error) {
        console.error('Error creating subject:', error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'Subject with this name already exists.' });
        }
        else {
            res.status(500).json({ message: 'Unexpected error creating subject.' });
        }
    }
});
exports.createSubject = createSubject;
/**
 * Get all Subjects with their Classes, Teachers, Lessons, Exams
 */
const getAllSubjects = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subjects = yield prisma.subject.findMany({
            include: {
                classes: { select: { id: true, name: true } },
                teachers: { select: { id: true, name: true } },
                lessons: true,
                exams: true,
            },
        });
        res.status(200).json({
            message: 'Subjects fetched successfully.',
            data: subjects,
        });
    }
    catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Unexpected error fetching subjects.' });
    }
});
exports.getAllSubjects = getAllSubjects;
