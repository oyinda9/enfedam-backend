import { Day, PrismaClient, UserSex, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("adminpassword", 10); // Hash the password
  console.log("Resetting database...");

  // Clear all tables (order matters due to foreign key constraints)
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.event.deleteMany();
  await prisma.announcement.deleteMany();

  console.log("Database cleared.");

  console.log("Seeding new data...");

  // Admin
  const admin = await prisma.admin.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Class
  const schoolClass = await prisma.class.create({
    data: {
      name: "1A",
      capacity: 20,
    },
  });

  // Subject
  const subject = await prisma.subject.create({
    data: {
      name: "Mathematics",
    },
  });

  // Teacher
  const teacher = await prisma.teacher.create({
    data: {
      username: "teacher1",
      name: "John",
      surname: "Doe",
      email: "teacher@example.com",
      phone: "123-456-7890",
      address: "123 Main St",
      bloodType: "A+",
      sex: UserSex.MALE,
      birthday: new Date("1990-01-01"),
      role: Role.TEACHER,
      subjects: { connect: { id: subject.id } },
      classes: { connect: { id: schoolClass.id } },
    },
  });

  // Lesson
  const lesson = await prisma.lesson.create({
    data: {
      name: "Algebra Basics",
      day: Day.MONDAY,
      startTime: new Date("2023-10-01T09:00:00Z"),
      endTime: new Date("2023-10-01T10:00:00Z"),
      subject: { connect: { id: subject.id } },
      class: { connect: { id: schoolClass.id } },
      teacher: { connect: { id: teacher.id } },
    },
  });

  // Parent
  const parent = await prisma.parent.create({
    data: {
      username: "parent1",
      name: "Jane",
      surname: "Doe",
      email: "parent@example.com",
      phone: "987-654-3210",
      address: "456 Oak St",
      role: Role.USER,
    },
  });

  // Student
  const student = await prisma.student.create({
    data: {
      username: "student1",
      name: "Alice",
      surname: "Doe",
      email: "student@example.com",
      phone: "555-555-5555",
      address: "789 Maple St",
      bloodType: "O-",
      sex: UserSex.FEMALE,
      birthday: new Date("2012-01-01"),
      role: Role.STUDENT,
      parent: { connect: { id: parent.id } },
      class: { connect: { id: schoolClass.id } },
    },
  });

  // Exam
  const exam = await prisma.exam.create({
    data: {
      title: "Midterm Exam",
      startTime: new Date("2023-11-01T09:00:00Z"),
      endTime: new Date("2023-11-01T11:00:00Z"),
      lesson: { connect: { id: lesson.id } },
    },
  });

  // Assignment
  const assignment = await prisma.assignment.create({
    data: {
      title: "Homework 1",
      startDate: new Date("2023-10-02T00:00:00Z"),
      dueDate: new Date("2023-10-09T23:59:59Z"),
      lesson: { connect: { id: lesson.id } },
    },
  });

  // Result
  await prisma.result.create({
    data: {
      score: 85,
      student: { connect: { id: student.id } },
      exam: { connect: { id: exam.id } },
    },
  });

  // Attendance
  await prisma.attendance.create({
    data: {
      date: new Date("2023-10-01T09:00:00Z"),
      present: true,
      student: { connect: { id: student.id } },
      lesson: { connect: { id: lesson.id } },
    },
  });

  // Event
  await prisma.event.create({
    data: {
      title: "School Sports Day",
      description: "A fun-filled day of sports activities.",
      startTime: new Date("2023-12-01T10:00:00Z"),
      endTime: new Date("2023-12-01T18:00:00Z"),
      class: { connect: { id: schoolClass.id } },
    },
  });

  // Announcement
  await prisma.announcement.create({
    data: {
      title: "Parent-Teacher Meeting",
      description: "Meeting scheduled for next week.",
      date: new Date("2023-10-30T00:00:00Z"),
      class: { connect: { id: schoolClass.id } },
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding data:", e);
    await prisma.$disconnect();
    process.exit(1);
  });