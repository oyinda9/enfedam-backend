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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = yield bcryptjs_1.default.hash("adminpassword", 10); // Hash the password
        console.log("Resetting database...");
        // Clear all tables (order matters due to foreign key constraints)
        yield prisma.result.deleteMany();
        yield prisma.attendance.deleteMany();
        yield prisma.assignment.deleteMany();
        yield prisma.exam.deleteMany();
        yield prisma.student.deleteMany();
        yield prisma.parent.deleteMany();
        yield prisma.lesson.deleteMany();
        yield prisma.teacher.deleteMany();
        yield prisma.subject.deleteMany();
        yield prisma.class.deleteMany();
        yield prisma.admin.deleteMany();
        yield prisma.event.deleteMany();
        yield prisma.announcement.deleteMany();
        console.log("Database cleared.");
        console.log("Seeding new data...");
        // Admin
        const admin = yield prisma.admin.create({
            data: {
                id: "some-unique-id", // If your schema requires an ID
                username: "admin",
                password: hashedPassword, // Ensure this is included
            },
        });
        ;
        // Class
        const schoolClass = yield prisma.class.create({
            data: {
                name: "1A",
                capacity: 20,
            },
        });
        // Subject
        const subject = yield prisma.subject.create({ data: { name: "Mathematics" } });
        // Teacher
        const teacher = yield prisma.teacher.create({
            data: {
                id: "teacher1",
                username: "teacher1",
                name: "John",
                surname: "Doe",
                email: "teacher@example.com",
                phone: "123-456-7890",
                address: "123 Main St",
                bloodType: "A+",
                sex: client_1.UserSex.MALE,
                subjects: { connect: { id: subject.id } },
                classes: { connect: { id: schoolClass.id } },
                birthday: new Date("1990-01-01"),
            },
        });
        // Lesson
        const lesson = yield prisma.lesson.create({
            data: {
                name: "Algebra Basics",
                day: client_1.Day.MONDAY,
                startTime: new Date(),
                endTime: new Date(),
                subjectId: subject.id,
                classId: schoolClass.id,
                teacherId: teacher.id,
            },
        });
        // Parent
        const parent = yield prisma.parent.create({
            data: {
                id: "parent1",
                username: "parent1",
                name: "Jane",
                surname: "Doe",
                email: "parent@example.com",
                phone: "987-654-3210",
                address: "456 Oak St",
            },
        });
        // Student
        const student = yield prisma.student.create({
            data: {
                id: "student1",
                username: "student1",
                name: "Alice",
                surname: "Doe",
                email: "student@example.com",
                phone: "555-555-5555",
                address: "789 Maple St",
                bloodType: "O-",
                sex: client_1.UserSex.FEMALE,
                parentId: parent.id,
                classId: schoolClass.id,
                birthday: new Date("2012-01-01"),
            },
        });
        // Exam
        const exam = yield prisma.exam.create({
            data: {
                title: "Midterm Exam",
                startTime: new Date(),
                endTime: new Date(),
                lessonId: lesson.id,
            },
        });
        // Assignment
        const assignment = yield prisma.assignment.create({
            data: {
                title: "Homework 1",
                startDate: new Date(),
                dueDate: new Date(),
                lessonId: lesson.id,
            },
        });
        // Result
        yield prisma.result.create({
            data: {
                score: 85,
                studentId: student.id,
                examId: exam.id,
            },
        });
        // Attendance
        yield prisma.attendance.create({
            data: {
                date: new Date(),
                present: true,
                studentId: student.id,
                lessonId: lesson.id,
            },
        });
        // Event
        yield prisma.event.create({
            data: {
                title: "School Sports Day",
                description: "A fun-filled day of sports activities.",
                startTime: new Date(),
                endTime: new Date(),
                classId: schoolClass.id,
            },
        });
        // Announcement
        yield prisma.announcement.create({
            data: {
                title: "Parent-Teacher Meeting",
                description: "Meeting scheduled for next week.",
                date: new Date(),
                classId: schoolClass.id,
            },
        });
        console.log("Seeding completed successfully.");
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));
