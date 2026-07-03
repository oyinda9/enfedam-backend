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
exports.getFullReport = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getFullReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.student.findMany({
            include: {
                parent: true,
                class: {
                    include: {
                        supervisor: true,
                        subjects: true,
                        students: true,
                        announcements: true,
                    },
                },
                Subject: true,
                payments: true,
                attendances: true,
                results: {
                    include: {
                        exam: true,
                        subject: true,
                    },
                },
            },
        });
        const teachers = yield prisma.teacher.findMany({
            include: {
                classes: true,
                subjects: true,
                lessons: {
                    include: {
                        subject: true,
                        class: true,
                    },
                },
            },
        });
        const classes = yield prisma.class.findMany({
            include: {
                supervisor: true,
                students: true,
                subjects: true,
                lessons: {
                    include: {
                        teacher: true,
                        subject: true,
                    },
                },
                announcements: true,
            },
        });
        const parents = yield prisma.parent.findMany({
            include: {
                students: true,
                payments: true,
            },
        });
        const payments = yield prisma.payment.findMany({
            include: {
                parent: true,
                student: true,
            },
        });
        const events = yield prisma.event.findMany();
        const announcements = yield prisma.announcement.findMany({
            include: {
                class: true,
            },
        });
        res.status(200).json({
            success: true,
            data: {
                students,
                teachers,
                classes,
                parents,
                payments,
                events,
                announcements,
            },
        });
    }
    catch (error) {
        console.error("Error generating full report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate report",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.getFullReport = getFullReport;
