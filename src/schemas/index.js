"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSectionFeeSchema = exports.CreateSectionFeeSchema = exports.UpdatePaymentSchema = exports.CreatePaymentSchema = exports.UpdateAnnouncementSchema = exports.CreateAnnouncementSchema = exports.UpdateEventSchema = exports.CreateEventSchema = exports.UpdateLessonSchema = exports.CreateLessonSchema = exports.CreateAttendanceSchema = exports.UpdateResultSchema = exports.CreateResultSchema = exports.CreateExamSchema = exports.CreateSubjectSchema = exports.UpdateClassSchema = exports.CreateClassSchema = exports.UpdateParentSchema = exports.CreateParentSchema = exports.UpdateTeacherSchema = exports.CreateTeacherSchema = exports.UpdateStudentSchema = exports.CreateStudentSchema = exports.LoginSchema = exports.RegisterAdminSchema = void 0;
const zod_1 = require("zod");
// Auth Schemas
exports.RegisterAdminSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50).trim(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[a-z]/, 'Password must contain lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number')
        .regex(/[@$!%*?&]/, 'Password must contain special character (@$!%*?&)'),
});
exports.LoginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'Username or email required'),
    password: zod_1.z.string().min(1, 'Password required'),
    surname: zod_1.z.string().optional(),
});
// Student Schemas
exports.CreateStudentSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50).trim(),
    name: zod_1.z.string().min(2).max(50).trim(),
    surname: zod_1.z.string().min(2).max(50).trim(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().min(5).max(500).trim(),
    bloodType: zod_1.z.string(),
    sex: zod_1.z.enum(['MALE', 'FEMALE']),
    birthday: zod_1.z.coerce.date(),
    classId: zod_1.z.number().int().positive(),
    parentId: zod_1.z.string().optional(),
});
exports.UpdateStudentSchema = exports.CreateStudentSchema.partial();
// Teacher Schemas
exports.CreateTeacherSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50).trim(),
    name: zod_1.z.string().min(2).max(50).trim(),
    surname: zod_1.z.string().min(2).max(50).trim(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().optional().or(zod_1.z.literal('')),
    address: zod_1.z.string().min(5).max(500).trim(),
    bloodType: zod_1.z.string(),
    sex: zod_1.z.enum(['MALE', 'FEMALE']),
    birthday: zod_1.z.coerce.date(),
});
exports.UpdateTeacherSchema = exports.CreateTeacherSchema.partial();
// Parent Schemas
exports.CreateParentSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50).trim(),
    name: zod_1.z.string().min(2).max(50).trim(),
    surname: zod_1.z.string().min(2).max(50).trim(),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    phone: zod_1.z.string().min(10),
    address: zod_1.z.string().min(5).max(500).trim(),
});
exports.UpdateParentSchema = exports.CreateParentSchema.partial();
// Class Schemas
exports.CreateClassSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).trim(),
    capacity: zod_1.z.number().int().positive(),
    supervisorId: zod_1.z.string().optional(),
    sectionId: zod_1.z.number().int().positive().optional(),
});
exports.UpdateClassSchema = exports.CreateClassSchema.partial();
// Subject Schemas
exports.CreateSubjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).trim(),
});
// Exam Schemas
exports.CreateExamSchema = zod_1.z.object({
    score: zod_1.z.number().min(0).max(100),
    subjectId: zod_1.z.number().int().positive(),
});
// Result Schemas
exports.CreateResultSchema = zod_1.z.object({
    score: zod_1.z.number().min(0).max(100),
    studentId: zod_1.z.string(),
    subjectId: zod_1.z.number().int().positive(),
    examId: zod_1.z.number().int().optional(),
    assignment: zod_1.z.number().min(0).max(100).default(0),
    attendance: zod_1.z.number().min(0).max(100).default(0),
    classwork: zod_1.z.number().min(0).max(100).default(0),
    midterm: zod_1.z.number().min(0).max(100).default(0),
});
exports.UpdateResultSchema = exports.CreateResultSchema.partial();
// Attendance Schemas
exports.CreateAttendanceSchema = zod_1.z.object({
    date: zod_1.z.coerce.date(),
    present: zod_1.z.boolean(),
    studentId: zod_1.z.string(),
});
// Lesson Schemas
exports.CreateLessonSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).trim(),
    day: zod_1.z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
    startTime: zod_1.z.coerce.date(),
    endTime: zod_1.z.coerce.date(),
    subjectId: zod_1.z.number().int().positive(),
    classId: zod_1.z.number().int().positive(),
    teacherId: zod_1.z.string(),
});
exports.UpdateLessonSchema = exports.CreateLessonSchema.partial();
// Event Schemas
exports.CreateEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200).trim(),
    description: zod_1.z.string().min(5).max(2000).trim(),
});
exports.UpdateEventSchema = exports.CreateEventSchema.partial();
// Announcement Schemas
exports.CreateAnnouncementSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).max(200).trim(),
    description: zod_1.z.string().min(5).max(2000).trim(),
    date: zod_1.z.coerce.date(),
    classId: zod_1.z.number().int().positive().optional(),
});
exports.UpdateAnnouncementSchema = exports.CreateAnnouncementSchema.partial();
// Payment Schemas
exports.CreatePaymentSchema = zod_1.z.object({
    studentId: zod_1.z.string(),
    parentId: zod_1.z.string(),
    amountPaid: zod_1.z.number().positive(),
    receiptUrl: zod_1.z.string().url().optional(),
});
exports.UpdatePaymentSchema = exports.CreatePaymentSchema.partial();
// Section Fee Schemas
exports.CreateSectionFeeSchema = zod_1.z.object({
    sectionId: zod_1.z.number().int().positive(),
    amount: zod_1.z.number().positive(),
});
exports.UpdateSectionFeeSchema = exports.CreateSectionFeeSchema.partial();
