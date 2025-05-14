// controllers/PaymentController.ts
import { Request, Response } from "express";
import { createWorker, RecognizeResult } from 'tesseract.js';
import { PrismaClient } from "@prisma/client";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Define the fee structure based on keywords in class name
const sectionFees = {
  nursery: 30000, // Fee for Nursery section
  primary: 35000, // Fee for Primary section
  secondary: 42000, // Fee for Secondary section
};


export const uploadReceipt = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { studentId, parentId } = req.body;
    const file = req.file;
  
    if (!file || !studentId || !parentId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
  
    const filePath = file.path;
    const receiptUrl = `/uploads/${file.filename}`;
  
    try {
      // Use simple Tesseract recognize method (no worker)
      const result = await Tesseract.recognize(filePath, 'eng', {
        logger: (m) => console.log(m), // optional
      });
  
      const text = result.data.text;
      console.log('OCR Extracted Text:\n', text);
  
      // Attempt to extract amount with multiple patterns
      const amountPatterns = [
        /(?:total|amount|paid|balance)\s*[:=]?\s*(?:₦|#|NGN)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i,
        /(?:₦|#|NGN)\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\b/,
        /\b(\d{3,}(?:,\d{3})*(?:\.\d+)?)\b/,
      ];
  
      let amountMatch = null;
      for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
          amountMatch = match;
          break;
        }
      }
  
      if (!amountMatch) {
        console.log('No valid amount found in OCR text.');
        res.status(400).json({ error: 'Could not extract a valid amount from receipt' });
        return;
      }
  
      const rawAmount = amountMatch[1].replace(/,/g, '');
      const amount = parseFloat(rawAmount);
  
      if (isNaN(amount) || amount <= 0) {
        console.log('Amount is not a valid positive number');
        res.status(400).json({ error: 'Extracted amount is not a valid positive number' });
        return;
      }
  
      // Save to database
      const payment = await prisma.payment.create({
        data: {
          studentId,
          parentId,
          amountPaid: amount,
          receiptUrl,
          verified: false,
        },
      });
  
      // Clean up file
      try {
        fs.unlinkSync(path.resolve(filePath));
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
  
      res.status(200).json({
        message: 'Receipt uploaded successfully',
        payment,
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      res.status(500).json({ error: 'Error processing receipt' });
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

// Function to check payment status
export const checkPaymentStatus = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  try {
    // Fetch student and class name
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student || !student.class) {
      return res.status(404).json({ error: "Student or class not found" });
    }

    const className = student.class.name.toLowerCase(); // Now safe to call toLowerCase

    let feeAmount = 0;
    if (className.includes("nursery")) {
      feeAmount = sectionFees.nursery;
    } else if (className.includes("primary")) {
      feeAmount = sectionFees.primary;
    } else if (className.includes("secondary") || className.includes("ss")) {
      feeAmount = sectionFees.secondary;
    } else {
      return res
        .status(400)
        .json({ error: "Could not determine section from class name" });
    }

    // Fetch all payments made by this student
    const payments = await prisma.payment.findMany({
      where: { studentId },
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    let status = "";
    if (totalPaid === 0) status = "Not Paid";
    else if (totalPaid < feeAmount) status = "Partially Paid";
    else status = "Fully Paid";

    res.status(200).json({
      studentId,
      class: className,
      totalPaid,
      feeAmount,
      status,
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
        class: true,
        payments: true,
      },
    });

    const fullyPaid: any[] = [];
    const awaitingVerification: any[] = [];
    const notPaid: any[] = [];

    for (const student of students) {
      const className = student.class.name.toLowerCase();

      // Determine fee based on class name
      let expectedFee = 0;
      if (className.includes("nursery")) {
        expectedFee = 30000;
      } else if (className.includes("primary")) {
        expectedFee = 35000;
      } else if (className.includes("ss") || className.includes("secondary")) {
        expectedFee = 42000;
      }

      const verifiedPayments = student.payments.filter((p) => p.verified);
      const totalVerified = verifiedPayments.reduce(
        (sum, p) => sum + p.amountPaid,
        0
      );

      if (student.payments.length === 0) {
        notPaid.push(student);
      } else if (verifiedPayments.length === 0) {
        awaitingVerification.push(student);
      } else if (totalVerified >= expectedFee) {
        fullyPaid.push(student);
      } else {
        awaitingVerification.push(student); // or you could create a new `partiallyPaid` array
      }
    }

    res.status(200).json({
      fullyPaid,
      awaitingVerification,
      notPaid,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong while generating summary" });
  }
};
