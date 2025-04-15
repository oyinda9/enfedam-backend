import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Create a new result

export const createResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      examScore,
      studentId,
      subjectId,
      assignment = 0,
      classwork = 0,
      midterm = 0,
      attendance = 0,
    } = req.body;

    // Step 1: Fetch student and check if enrolled in the subject
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        subject: true,
      },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const isTakingSubject = student.subject.some(
      (subject) => subject.id === subjectId
    );
    if (!isTakingSubject) {
      res
        .status(400)
        .json({ message: "Student is not enrolled in this subject" });
      return;
    }

    // Step 2: Calculate total score and average score
    const totalScore =
      examScore + assignment + classwork + midterm + attendance;
    const averageScore = totalScore / 5;
    const score = totalScore; // Set score to be equal to totalScore

    // Step 3: Create the result
    const result = await prisma.result.create({
      data: {
        score, // The score is the same as the totalScore
        examScore,
        assignment,
        classwork,
        midterm,
        attendance,
        totalScore,
        averageScore,
        student: { connect: { id: studentId } },
        subject: { connect: { id: subjectId } },
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating result:", error);
    res.status(500).json({ message: "Failed to create result" });
  }
};

// Get all results
export const getAllResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: true,
        exam: true,
        subject: true,
      },
    });

    res.status(200).json(results); // Respond with the list of results
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};

// Get a result by ID
export const getResultById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await prisma.result.findUnique({
      where: { id: Number(id) },
      include: {
        student: true,
        exam: true,
        subject: true,
      },
    });

    if (!result) {
      res.status(404).json({ message: "Result not found" });
      return;
    }

    res.status(200).json(result); // Respond with the result
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch result" });
  }
};
export const getResultsByStudentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { studentId } = req.params;

    // Fetch all results for the student including subject details
    const results = await prisma.result.findMany({
      where: { studentId },
      include: {
        subject: true,
      },
    });

    if (results.length === 0) {
      res.status(404).json({ message: "No results found for this student" });
      return;
    }

    const groupedResults: Record<string, any> = {};
    let totalScore = 0;
    let totalSubjects = 0;

    results.forEach((result) => {
      const subjectName = result.subject?.name; // Ensure subject is present

      if (!subjectName) {
        console.error(`No subject name found for result with id: ${result.id}`);
        return; // Skip if subject name is missing
      }

      // Sum up the individual result score
      const totalResultScore = result.score; // If score is the total, don't add components again

      if (!groupedResults[subjectName]) {
        groupedResults[subjectName] = {
          subjectId: result.subjectId,
          subjectName,
          scores: [],
        };
      }

      groupedResults[subjectName].scores.push({
        resultId: result.id,
        score: result.score,
        assignment: result.assignment ?? 0,
        classwork: result.classwork ?? 0,
        midterm: result.midterm ?? 0,
        attendance: result.attendance ?? 0,
        total: totalResultScore, // Total is just the score here
      });

      totalScore += totalResultScore;
      totalSubjects += 1;
    });

    const averageScore = totalSubjects > 0 ? totalScore / totalSubjects : 0;

    res.status(200).json({
      studentId,
      totalScore,
      averageScore,
      subjects: Object.values(groupedResults),
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};
//for one student
export const getOneStudentsCummulatedResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  const studentId = req.params.id;  // Access the student ID from the route parameter
  try {
    // Fetch results for the specific student
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId, // Filter by student ID
      },
      include: {
        student: true,
      },
    });

    if (results.length === 0) {
      res.status(404).json({ message: "No results found for this student" });
      return;
    }

    // Process and format the results as needed
    // ...

    res.status(200).json(results); // Send the results to the client
  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};






export const getAllStudentsCummulatedResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const results = await prisma.result.findMany({
      include: {
        student: true, // Include the student data in the result
      },
    });

    if (results.length === 0) {
      res.status(404).json({ message: "No results found for any student" });
      return;
    }

    const studentResults: Record<string, any> = {};

    results.forEach((result) => {
      const studentId = result.studentId;
      const studentName = `${result.student?.name} ${result.student?.surname}`;

      // Initialize student results if not already done
      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          studentId,
          studentName,
          totalAssignment: 0,
          totalClasswork: 0,
          totalMidterm: 0,
          totalAttendance: 0,
          totalExam: 0,
          totalSubjects: 0,
          overallTotal: 0,
        };
      }

      const student = studentResults[studentId];

      const assignment = result.assignment ?? 0;
      const classwork = result.classwork ?? 0;
      const midterm = result.midterm ?? 0;
      const attendance = result.attendance ?? 0;
      const examScore = result.examScore ?? 0;

      const total = assignment + classwork + midterm + attendance + examScore;

      // Accumulate scores
      student.totalAssignment += assignment;
      student.totalClasswork += classwork;
      student.totalMidterm += midterm;
      student.totalAttendance += attendance;
      student.totalExam += examScore;
      student.overallTotal += total;
      student.totalSubjects += 1;
    });

    // Format the results to send to the client
    const formattedResults = Object.values(studentResults).map((student) => {
      return {
        studentId: student.studentId,
        studentName: student.studentName,
        totalAssignment: student.totalAssignment,
        totalClasswork: student.totalClasswork,
        totalMidterm: student.totalMidterm,
        totalAttendance: student.totalAttendance,
        totalExam: student.totalExam,
        overallTotal: student.overallTotal,
        totalSubjects: student.totalSubjects,
      };
    });

    res.status(200).json(formattedResults); // Send the results to the client
  } catch (error) {
    console.error("Error fetching student results:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
};


// Update a result
export const updateResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { score, examId, studentId, subjectId } = req.body;

    const result = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        score,
        exam: examId ? { connect: { id: examId } } : undefined,
        student: studentId ? { connect: { id: studentId } } : undefined,
        subject: subjectId ? { connect: { id: subjectId } } : undefined,
      },
    });

    res.status(200).json(result); // Respond with the updated result
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update result" });
  }
};

// Delete a result
export const deleteResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.result.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete result" });
  }
};
