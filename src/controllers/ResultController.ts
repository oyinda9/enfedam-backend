// @ts-ignore
import { PrismaClient, Term } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Create a new result

const VALID_TERMS: Term[] = [Term.FIRST, Term.SECOND, Term.THIRD];

export const createResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      examScore,
      studentId,
      subjectId,
      session,
      term,
      assignment = 0,
      classwork = 0,
      midterm = 0,
      attendance = 0,
    } = req.body;

    if (!session || typeof session !== "string") {
      res.status(400).json({ message: "session is required, e.g. \"2024/2025\"." });
      return;
    }
    const normalizedTerm = typeof term === "string" ? (term.toUpperCase() as Term) : undefined;
    if (!normalizedTerm || !VALID_TERMS.includes(normalizedTerm)) {
      res.status(400).json({ message: `term is required and must be one of ${VALID_TERMS.join(", ")}.` });
      return;
    }

    // Step 1: Fetch student and check if enrolled in the subject
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        Subject: true,
      },
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const isTakingSubject = student.Subject.some(
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

    // Step 3: Create or replace the result for this student/subject/session/term -
    // re-recording the same combination updates the existing row instead of
    // piling up duplicates.
    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId_session_term: {
          studentId,
          subjectId,
          session,
          term: normalizedTerm,
        },
      },
      update: {
        score,
        examScore,
        assignment,
        classwork,
        midterm,
        attendance,
        totalScore,
        averageScore,
      },
      create: {
        score,
        examScore,
        assignment,
        classwork,
        midterm,
        attendance,
        totalScore,
        averageScore,
        session,
        term: normalizedTerm,
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
    const { session, term } = req.query;

    // Fetch all results for the student including subject details
    const results = await prisma.result.findMany({
      where: {
        studentId,
        ...(session ? { session: String(session) } : {}),
        ...(term ? { term: String(term).toUpperCase() as Term } : {}),
      },
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

    results.forEach((result:any) => {
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
        session: result.session,
        term: result.term,
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

export const getAllStudentsCummulatedResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { session, term } = req.query;
    const results = await prisma.result.findMany({
      where: {
        ...(session ? { session: String(session) } : {}),
        ...(term ? { term: String(term).toUpperCase() as Term } : {}),
      },
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
      subjectIds: Set<number>;
    };

    const studentResults = results.reduce<Record<string, StudentResult>>((acc:any, result:any) => {
      const studentId = result.studentId;
      if (!acc[studentId]) {
        acc[studentId] = {
          studentId,
          studentName: `${result.student?.name || ''} ${result.student?.surname || ''}`.trim(),
          totals: { assignment: 0, classwork: 0, midterm: 0, attendance: 0, exam: 0 },
          overallTotal: 0,
          subjectCount: 0,
          subjectIds: new Set<number>(),
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
      student.subjectIds.add(result.subjectId);

      return acc;
    }, {}); // TypeScript now knows this will be Record<string, StudentResult>

    const data = Object.values(studentResults).map((s) => {
      const { subjectIds, ...rest } = s;
      return { ...rest, subjectCount: subjectIds.size };
    });

    res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get cumulative results for ONE specific student

export const getOneStudentsCummulatedResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { session, term } = req.query;

    // Get all results for the specified student
    const results = await prisma.result.findMany({
      where: {
        studentId: id,
        ...(session ? { session: String(session) } : {}),
        ...(term ? { term: String(term).toUpperCase() as Term } : {}),
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

    results.forEach((result:any) => {
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
        session: result.session,
        term: result.term,
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
    const { examId, studentId, subjectId, assignment, classwork, midterm, attendance, examScore } = req.body;

    const existing = await prisma.result.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ message: "Result not found" });
      return;
    }

    // Recompute totalScore/averageScore/score whenever any component changes,
    // falling back to the existing row's value for anything not sent.
    const componentsChanged = [assignment, classwork, midterm, attendance, examScore].some((v) => v !== undefined);
    const nextAssignment = assignment ?? existing.assignment;
    const nextClasswork = classwork ?? existing.classwork;
    const nextMidterm = midterm ?? existing.midterm;
    const nextAttendance = attendance ?? existing.attendance;
    const nextExamScore = examScore ?? existing.examScore ?? 0;

    const totalScore = nextAssignment + nextClasswork + nextMidterm + nextAttendance + nextExamScore;
    const averageScore = totalScore / 5;

    const result = await prisma.result.update({
      where: { id: Number(id) },
      data: {
        assignment: nextAssignment,
        classwork: nextClasswork,
        midterm: nextMidterm,
        attendance: nextAttendance,
        examScore: nextExamScore,
        ...(componentsChanged ? { totalScore, averageScore, score: totalScore } : {}),
        exam: examId ? { connect: { id: examId } } : undefined,
        student: studentId ? { connect: { id: studentId } } : undefined,
        subject: subjectId ? { connect: { id: subjectId } } : undefined,
      },
    });

    res.status(200).json(result); // Respond with the updated result
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "A result for this student/subject/session/term already exists." });
      return;
    }
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

    const existing = await prisma.result.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      res.status(404).json({ message: "Result not found" });
      return;
    }

    await prisma.result.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete result" });
  }
};
