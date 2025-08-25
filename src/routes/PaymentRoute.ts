// routes/paymentRoutes.ts
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  uploadReceipt,
  verifyPayment,
  rejectPayment,
  checkPaymentStatus,
  getPaymentSummary,
  getPaymentHistoryByParentId,
  setSectionFee,
  getSectionFees,
  getPaymentsAwaitingVerification,
} from "../controllers/PaymentController";

const router = express.Router();

// Ensure uploads/receipts directory exists
const uploadDir = path.join(__dirname, "../uploads/receipts");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, JPG and PDF files are allowed."
        )
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Parent routes
router.post("/upload", upload.single("receipt"), uploadReceipt);
router.get("/history/:parentId", getPaymentHistoryByParentId);
router.get("/status/:studentId", checkPaymentStatus);

// Admin routes
router.patch("/verify/:paymentId", verifyPayment);
router.patch("/reject/:paymentId", rejectPayment);
router.get("/summary", getPaymentSummary);
router.post("/fees", setSectionFee);
router.get("/fees", getSectionFees);
router.get("/awaiting-verification", getPaymentsAwaitingVerification);

export default router;
