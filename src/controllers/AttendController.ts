import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { studentId, present } = req.body;

  if (!studentId || typeof present !== "boolean") {
    res
      .status(400)
      .json({ error: "Missing required fields: studentId and present" });
    return;
  }

  try {
    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        present,
        date: new Date(),
      },
    });

    res.status(201).json({
      message: `Attendance marked as ${
        present ? "present" : "absent"
      } for student with ID ${studentId}.`,
      data: attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create attendance" });
  }
};

export const getAllAttendance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch all attendance records
    const attendanceRecords = await prisma.attendance.findMany();

    res.status(200).json({
      message: "Attendance records fetched successfully",
      data: attendanceRecords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
};

// Define the type for GroupedAttendance
interface GroupedAttendance {
  className: string;
  attendanceRecords: any[]; // Replace `any` with a more specific type if needed
}

export const getAllAttendanceByClass = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch all attendance records with associated student and class information
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        student: {
          include: {
            class: true, // Ensure class data is included
          },
        },
      },
    });

    // Define the type for grouped attendance
    const groupedAttendance: { [key: string]: GroupedAttendance } = {}; // Use the GroupedAttendance interface

    attendanceRecords.forEach((record) => {
      const classId = record.student.class.id;
      const className = record.student.class.name;

      // Initialize the group if it doesn't exist
      if (!groupedAttendance[classId]) {
        groupedAttendance[classId] = {
          className, // Store the class name
          attendanceRecords: [],
        };
      }

      // Add the attendance record to the group
      groupedAttendance[classId].attendanceRecords.push(record);
    });

    // Convert the object into an array format
    const formattedResponse = Object.values(groupedAttendance);

    res.status(200).json({
      message: "Attendance records grouped by class fetched successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
};

export const getAllAttendanceByClassStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });

    const groupedAttendance: { [key: string]: any } = {};

    attendanceRecords.forEach((record) => {
      const classId = record.student.class.id;
      const className = record.student.class.name;
      const gender = record.student.sex;
      const dayOfWeek = new Date(record.date).toLocaleString("en-us", {
        weekday: "short",
      });

      // Only include Monday to Friday
      const validDays = ["Mon", "Tue", "Wed", "Thurs", "Fri"];
      if (!validDays.includes(dayOfWeek)) return;

      if (!groupedAttendance[classId]) {
        groupedAttendance[classId] = {
          className,
          attendanceRecords: [],
          statistics: {
            Mon: {
              male: { present: 0, absent: 0 },
              female: { present: 0, absent: 0 },
            },
            Tue: {
              male: { present: 0, absent: 0 },
              female: { present: 0, absent: 0 },
            },
            Wed: {
              male: { present: 0, absent: 0 },
              female: { present: 0, absent: 0 },
            },
            Thurs: {
              male: { present: 0, absent: 0 },
              female: { present: 0, absent: 0 },
            },
            Fri: {
              male: { present: 0, absent: 0 },
              female: { present: 0, absent: 0 },
            },
          },
        };
      }

      const genderKey = gender?.toUpperCase() === "MALE" ? "male" : "female";
      const dayStats = groupedAttendance[classId].statistics[dayOfWeek];

      if (record.present) {
        dayStats[genderKey].present += 1;
      } else {
        dayStats[genderKey].absent += 1;
      }

      groupedAttendance[classId].attendanceRecords.push(record);
    });

    const formattedResponse = Object.values(groupedAttendance);

    res.status(200).json({
      message:
        "Attendance records grouped by class and gender fetched successfully",
      data: formattedResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
};

