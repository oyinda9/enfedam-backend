import { Day, PrismaClient, UserSex } from "@prisma/client";
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
      id: "some-unique-id", // If your schema requires an ID
      username: "admin",
      password: hashedPassword, // Ensure this is included
    },
  });


 ;

  // Class
  const schoolClass = await prisma.class.create({
    data: {
      name: "1A",
     
      capacity: 20,
    },
  });

  // Subject
  const subject = await prisma.subject.create({ data: { name: "Mathematics" } });

  // Teacher
  const teacher = await prisma.teacher.create({
    data: {
      id: "teacher1",
      username: "teacher1",
      name: "John",
      surname: "Doe",
      email: "teacher@example.com",
      phone: "123-456-7890",
      address: "123 Main St",
      bloodType: "A+",
      sex: UserSex.MALE,
      subjects: { connect: { id: subject.id } },
      classes: { connect: { id: schoolClass.id } },
      birthday: new Date("1990-01-01"),
    },
  });

  // Lesson
  const lesson = await prisma.lesson.create({
    data: {
      name: "Algebra Basics",
      day: Day.MONDAY,
      startTime: new Date(),
      endTime: new Date(),
      subjectId: subject.id,
      classId: schoolClass.id,
      teacherId: teacher.id,
    },
  });

  // Parent
  const parent = await prisma.parent.create({
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
  const student = await prisma.student.create({
    data: {
      id: "student1",
      username: "student1",
      name: "Alice",
      surname: "Doe",
      email: "student@example.com",
      phone: "555-555-5555",
      address: "789 Maple St",
      bloodType: "O-",
      sex: UserSex.FEMALE,
      parentId: parent.id,
     
      classId: schoolClass.id,
      birthday: new Date("2012-01-01"),
    },
  });

  // Exam
  const exam = await prisma.exam.create({
    data: {
      title: "Midterm Exam",
      startTime: new Date(),
      endTime: new Date(),
      lessonId: lesson.id,
    },
  });

  // Assignment
  const assignment = await prisma.assignment.create({
    data: {
      title: "Homework 1",
      startDate: new Date(),
      dueDate: new Date(),
      lessonId: lesson.id,
    },
  });

  // Result
  await prisma.result.create({
    data: {
      score: 85,
      studentId: student.id,
      examId: exam.id,
    },
  });

  // Attendance
  await prisma.attendance.create({
    data: {
      date: new Date(),
      present: true,
      studentId: student.id,
      lessonId: lesson.id,
    },
  });

  // Event
  await prisma.event.create({
    data: {
      title: "School Sports Day",
      description: "A fun-filled day of sports activities.",
      startTime: new Date(),
      endTime: new Date(),
      classId: schoolClass.id,
    },
  });

  // Announcement
  await prisma.announcement.create({
    data: {
      title: "Parent-Teacher Meeting",
      description: "Meeting scheduled for next week.",
      date: new Date(),
      classId: schoolClass.id,
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
