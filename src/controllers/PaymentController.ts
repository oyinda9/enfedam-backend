// controllers/PaymentController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const uploadReceipt = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Add debug logging to see what's coming in
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  
  const { studentId, parentId, amountPaid } = req.body;
  const file = req.file;

  // Check if any field is missing
  if (!file) {
    console.log("No file uploaded");
    res.status(400).json({ error: "Please upload a receipt file" });
    return;
  }

  if (!studentId) {
    console.log("Missing studentId");
    res.status(400).json({ error: "Missing studentId" });
    return;
  }

  if (!parentId) {
    console.log("Missing parentId");
    res.status(400).json({ error: "Missing parentId" });
    return;
  }

  if (!amountPaid) {
    console.log("Missing amountPaid");
    res.status(400).json({ error: "Missing amountPaid" });
    return;
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    res.status(400).json({ error: "Only JPEG, PNG images and PDF files are allowed" });
    
    // Clean up the uploaded file
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (cleanupError) {
      console.error("File cleanup error:", cleanupError);
    }
    
    return;
  }

  try {
    // File is already saved by multer, just use the existing path
    const receiptUrl = `../uploads/receipts/${file.filename}`;

    const payment = await prisma.payment.create({
      data: {
        studentId: studentId.trim(),
        parentId: parentId.trim(),
        amountPaid: parseFloat(amountPaid),
        receiptUrl,
        verified: false,
      },
    });

    res.status(200).json({
      message: "Receipt uploaded successfully, awaiting verification",
      payment,
      receiptUrl, // Include the URL for reference
    });
  } catch (error) {
    console.error("Error uploading receipt:", error);

    // Clean up the uploaded file if there was an error
    try {
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (cleanupError) {
      console.error("File cleanup error:", cleanupError);
    }

    res.status(500).json({ error: "Error uploading receipt" });
  }
};

// Function to handle payment verification
export const verifyPayment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  try {
    // Update the payment status to verified
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { verified: true },
    });

    // Respond with a success message and the updated payment details
    res.status(200).json({ message: "Payment verified", updated });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Unable to verify payment" });
  }
};

// Function to reject/unverify a payment
export const rejectPayment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { reason } = req.body;

  try {
    // Update the payment status to unverified and add rejection reason
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        verified: false,
        rejectionReason: reason || "Payment rejected by administrator",
      },
    });

    res.status(200).json({ message: "Payment rejected", updated });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Unable to reject payment" });
  }
};

// Function to check payment status
export const checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  const { studentId } = req.params;

  try {
    const student: any = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: {
          include: {
            section: {
              include: {
                fee: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.class) {
      res.status(404).json({ error: "Student or class not found" });
      return;
    }

    let feeAmount = 0;
    if (student.class.section.fee) {
      feeAmount = student.class.section.fee.amount;
    } else {
      const className = student.class.name.toLowerCase();
      if (className.includes("nursery")) {
        feeAmount = 30000;
      } else if (className.includes("primary")) {
        feeAmount = 35000;
      } else if (className.includes("secondary") || className.includes("ss")) {
        feeAmount = 42000;
      } else {
        res.status(400).json({ error: "Fee not set for this section. Please contact administrator." });
        return;
      }
    }

    const payments = await prisma.payment.findMany({
      where: { studentId, verified: true },
    });

    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amountPaid, 0);

    let status = "";
    if (totalPaid === 0) status = "Not Paid";
    else if (totalPaid < feeAmount) status = "Partially Paid";
    else status = "Fully Paid";

    res.status(200).json({
      studentId,
      class: student.class.name,
      section: student.class.section.name,
      totalPaid,
      feeAmount,
      status,
      balance: feeAmount - totalPaid,
      payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error checking payment status" });
  }
};

export const getPaymentSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: {
          include: {
            section: {
              include: {
                fee: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    const fullyPaid: any[] = [];
    const awaitingVerification: any[] = [];
    const notPaid: any[] = [];
    const partiallyPaid: any[] = [];

    for (const student of students) {
      // Determine expected fee
      let expectedFee = 0;
      if (student.class.section && student.class.section.fee) {
        expectedFee = student.class.section.fee.amount;
      } else {
        // Fallback to default fees
        const className = student.class.name.toLowerCase();
        if (className.includes("nursery")) expectedFee = 30000;
        else if (className.includes("primary")) expectedFee = 35000;
        else if (className.includes("secondary") || className.includes("ss"))
          expectedFee = 42000;
      }

      const verifiedPayments = student.payments.filter((p: any) => p.verified);
      const totalVerified = verifiedPayments.reduce(
        (sum: any, p: any) => sum + p.amountPaid,
        0
      );

      if (student.payments.length === 0) {
        notPaid.push({
          ...student,
          totalPaid: 0,
          expectedFee,
          balance: expectedFee,
        });
      } else if (student.payments.some((p: any) => !p.verified)) {
        awaitingVerification.push({
          ...student,
          totalPaid: totalVerified,
          expectedFee,
          balance: expectedFee - totalVerified,
        });
      } else if (totalVerified >= expectedFee) {
        fullyPaid.push({
          ...student,
          totalPaid: totalVerified,
          expectedFee,
          balance: 0,
        });
      } else {
        partiallyPaid.push({
          ...student,
          totalPaid: totalVerified,
          expectedFee,
          balance: expectedFee - totalVerified,
        });
      }
    }

    res.status(200).json({
      fullyPaid,
      awaitingVerification,
      partiallyPaid,
      notPaid,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while generating summary" });
  }
};

export const getPaymentHistoryByParentId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { parentId } = req.params;

  try {
    // Find all students belonging to the parent
    const students = await prisma.student.findMany({
      where: { parentId },
      include: {
        class: {
          include: {
            section: true,
          },
        },
      },
    });

    if (!students || students.length === 0) {
      res.status(404).json({ message: "No students found for this parent." });
      return;
    }

    const studentIds = students.map((student: any) => student.id);

    // Fetch all payments for those students
    const payments = await prisma.payment.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          include: {
            class: true,
          },
        },
      },
    });

    const response = payments.map((payment: any) => ({
      id: payment.id,
      date: payment.createdAt.toISOString().split("T")[0],
      receiptUrl: payment.receiptUrl,
      amount: payment.amountPaid,
      verified: payment.verified,
      rejectionReason: payment.rejectionReason,
      studentId: payment.studentId,
      studentName: `${payment.student.name} ${payment.student.surname}`,
      className: payment.student.class.name,
    }));

    res.json({ payments: response });
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin function to set section fees
export const setSectionFee = async (req: Request, res: Response) => {
  const { sectionId, amount } = req.body;

  try {
    const sectionFee = await prisma.sectionFee.upsert({
      where: { sectionId: parseInt(sectionId) },
      update: { amount },
      create: {
        sectionId: parseInt(sectionId),
        amount,
      },
    });

    res.status(200).json({
      message: "Section fee updated successfully",
      sectionFee,
    });
  } catch (error) {
    console.error("Error setting section fee:", error);
    res.status(500).json({ error: "Error setting section fee" });
  }
};

// Get all section fees
export const getSectionFees = async (req: Request, res: Response) => {
  try {
    const sectionFees = await prisma.sectionFee.findMany({
      include: {
        section: true,
      },
    });

    res.status(200).json({ sectionFees });
  } catch (error) {
    console.error("Error getting section fees:", error);
    res.status(500).json({ error: "Error getting section fees" });
  }
};

// Get payments awaiting verification
export const getPaymentsAwaitingVerification = async (
  req: Request,
  res: Response
) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { verified: false },
      include: {
        student: {
          include: {
            class: {
              include: {
                section: true,
              },
            },
          },
        },
        parent: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ payments });
  } catch (error) {
    console.error("Error getting payments awaiting verification:", error);
    res
      .status(500)
      .json({ error: "Error getting payments awaiting verification" });
  }
};
