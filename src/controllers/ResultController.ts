// @ts-ignore
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
      (subject:any) => subject.id === subjectId
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
// Get cumulative results for ALL students (no ID needed)
// Get cumulative results for ALL students (no ID needed)
export const getAllStudentsCummulatedResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const results = await prisma.result.findMany({
      include: { student: true },
    });

    if (!results.length) {
      res.status(404).json({ message: "No results found" });
      return;
    }

    // Define the type for the accumulator
    type StudentResult = {
      studentId: string;
      studentName: string;
      totals: {
        assignment: number;
        classwork: number;
        midterm: number;
        attendance: number;
        exam: number;
      };
      overallTotal: number;
      subjectCount: number;
    };

    const studentResults = results.reduce<Record<string, StudentResult>>((acc, result) => {
      const studentId = result.studentId;
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName: `${result.student?.name || ''} ${result.student?.surname || ''}`.trim(),
          totals: { assignment: 0, classwork: 0, midterm: 0, attendance: 0, exam: 0 },
          overallTotal: 0,
          subjectCount: 0
        };
      }

      const student = acc[studentId];
      student.totals.assignment += result.assignment || 0;
      student.totals.classwork += result.classwork || 0;
      student.totals.midterm += result.midterm || 0;
      student.totals.attendance += result.attendance || 0;
      student.totals.exam += result.examScore || 0;
      student.overallTotal += (result.assignment || 0) + (result.classwork || 0) + 
                             (result.midterm || 0) + (result.attendance || 0) + 
                             (result.examScore || 0);
      student.subjectCount++;

      return acc;
    }, {}); // TypeScript now knows this will be Record<string, StudentResult>

    res.status(200).json(Object.values(studentResults));
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get cumulative results for ONE specific student
// Get cumulative results for ONE specific student
export const getOneStudentsCummulatedResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Get all results for the specified student
    const results = await prisma.result.findMany({
      where: {
        studentId: id,
      },
      include: {
        student: true,
        exam: true,
        subject: true,
      },
    });

    if (results.length === 0) {
      res.status(404).json({ message: "No results found for this student" });
      return;
    }

    // Initialize accumulator for the single student
    const studentResult = {
      studentId: id,
      studentName: `${results[0].student?.name ?? ''} ${results[0].student?.surname ?? ''}`.trim(),
      totalAssignment: 0,
      totalClasswork: 0,
      totalMidterm: 0,
      totalAttendance: 0,
      totalExam: 0,
      totalSubjects: 0,
      overallTotal: 0,
      averageScore: 0, // Add this field for the average score
      subjectDetails: [] as any[],
    };

    const uniqueSubjects = new Set<number>(); // Track unique subject IDs

    results.forEach((result) => {
      const assignment = result.assignment ?? 0;
      const classwork = result.classwork ?? 0;
      const midterm = result.midterm ?? 0;
      const attendance = result.attendance ?? 0;
      const examScore = result.examScore ?? 0;
      const total = assignment + classwork + midterm + attendance + examScore;

      studentResult.totalAssignment += assignment;
      studentResult.totalClasswork += classwork;
      studentResult.totalMidterm += midterm;
      studentResult.totalAttendance += attendance;
      studentResult.totalExam += examScore;
      studentResult.overallTotal += total;

      // Track unique subjects
      if (result.subjectId) {
        uniqueSubjects.add(result.subjectId);
      }

      // Add subject details
      studentResult.subjectDetails.push({
        subjectId: result.subjectId,
        subjectName: result.subject?.name,
        examId: result.examId,
        examName: result.exam,
        assignment,
        classwork,
        midterm,
        attendance,
        examScore,
        total,
      });
    });

    // Set the correct totalSubjects count
    studentResult.totalSubjects = uniqueSubjects.size;

    // Calculate average score
    if (studentResult.totalSubjects > 0) {
      studentResult.averageScore = studentResult.overallTotal / studentResult.totalSubjects;
    }

    res.status(200).json(studentResult);
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
