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
exports.createAttendance = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId, present } = req.body;
    if (!studentId || typeof present !== 'boolean') {
        res.status(400).json({ error: 'Missing required fields: studentId and present' });
        return;
    }
    try {
        const attendance = yield prisma.attendance.create({
            data: {
                studentId,
                present,
                date: new Date()
            }
        });
        res.status(201).json({
            message: `Attendance marked as ${present ? 'present' : 'absent'} for student with ID ${studentId}.`,
            data: attendance
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create attendance' });
    }
});
exports.createAttendance = createAttendance;
