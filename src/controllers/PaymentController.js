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
exports.getPaymentsAwaitingVerification = exports.getSectionFees = exports.setSectionFee = exports.getPaymentHistoryByParentId = exports.getPaymentSummary = exports.checkPaymentStatus = exports.rejectPayment = exports.verifyPayment = exports.uploadReceipt = void 0;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const uploadReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Add debug logging to see what's coming in
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    // Handle field names with or without spaces
    const studentId = req.body.studentId || req.body.studentId;
    const parentId = req.body.parentId || req.body.parentId;
    const amountPaid = req.body.amountPaid || req.body['amountPaid ']; // Handle both cases
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
        console.log("Available fields:", Object.keys(req.body));
        res.status(400).json({
            error: "Missing amountPaid",
            details: "Check if there's a space in the field name"
        });
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
            if (file.path && fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
        }
        catch (cleanupError) {
            console.error("File cleanup error:", cleanupError);
        }
        return;
    }
    try {
        // File is already saved by multer, just use the existing path
        const receiptUrl = `../uploads/receipts/${file.filename}`;
        const payment = yield prisma.payment.create({
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
            receiptUrl,
        });
    }
    catch (error) {
        console.error("Error uploading receipt:", error);
        // Clean up the uploaded file if there was an error
        try {
            if (file && file.path && fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
        }
        catch (cleanupError) {
            console.error("File cleanup error:", cleanupError);
        }
        res.status(500).json({ error: "Error uploading receipt" });
    }
});
exports.uploadReceipt = uploadReceipt;
// Function to handle payment verification
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId } = req.params;
    try {
        // Update the payment status to verified
        const updated = yield prisma.payment.update({
            where: { id: paymentId },
            data: { verified: true },
        });
        // Respond with a success message and the updated payment details
        res.status(200).json({ message: "Payment verified", updated });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Unable to verify payment" });
    }
});
exports.verifyPayment = verifyPayment;
// Function to reject/unverify a payment
const rejectPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId } = req.params;
    const { reason } = req.body;
    try {
        // Update the payment status to unverified and add rejection reason
        const updated = yield prisma.payment.update({
            where: { id: paymentId },
            data: {
                verified: false,
                rejectionReason: reason || "Payment rejected by administrator",
            },
        });
        res.status(200).json({ message: "Payment rejected", updated });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ error: "Unable to reject payment" });
    }
});
exports.rejectPayment = rejectPayment;
// Function to check payment status
const checkPaymentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { studentId } = req.params;
    try {
        const student = yield prisma.student.findUnique({
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
        }
        else {
            const className = student.class.name.toLowerCase();
            if (className.includes("nursery")) {
                feeAmount = 30000;
            }
            else if (className.includes("primary")) {
                feeAmount = 35000;
            }
            else if (className.includes("secondary") || className.includes("ss")) {
                feeAmount = 42000;
            }
            else {
                res.status(400).json({ error: "Fee not set for this section. Please contact administrator." });
                return;
            }
        }
        const payments = yield prisma.payment.findMany({
            where: { studentId, verified: true },
        });
        const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
        let status = "";
        if (totalPaid === 0)
            status = "Not Paid";
        else if (totalPaid < feeAmount)
            status = "Partially Paid";
        else
            status = "Fully Paid";
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error checking payment status" });
    }
});
exports.checkPaymentStatus = checkPaymentStatus;
const getPaymentSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.student.findMany({
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
        const fullyPaid = [];
        const awaitingVerification = [];
        const notPaid = [];
        const partiallyPaid = [];
        for (const student of students) {
            // Determine expected fee
            let expectedFee = 0;
            if (student.class.section && student.class.section.fee) {
                expectedFee = student.class.section.fee.amount;
            }
            else {
                // Fallback to default fees
                const className = student.class.name.toLowerCase();
                if (className.includes("nursery"))
                    expectedFee = 30000;
                else if (className.includes("primary"))
                    expectedFee = 35000;
                else if (className.includes("secondary") || className.includes("ss"))
                    expectedFee = 42000;
            }
            const verifiedPayments = student.payments.filter((p) => p.verified);
            const totalVerified = verifiedPayments.reduce((sum, p) => sum + p.amountPaid, 0);
            if (student.payments.length === 0) {
                notPaid.push(Object.assign(Object.assign({}, student), { totalPaid: 0, expectedFee, balance: expectedFee }));
            }
            else if (student.payments.some((p) => !p.verified)) {
                awaitingVerification.push(Object.assign(Object.assign({}, student), { totalPaid: totalVerified, expectedFee, balance: expectedFee - totalVerified }));
            }
            else if (totalVerified >= expectedFee) {
                fullyPaid.push(Object.assign(Object.assign({}, student), { totalPaid: totalVerified, expectedFee, balance: 0 }));
            }
            else {
                partiallyPaid.push(Object.assign(Object.assign({}, student), { totalPaid: totalVerified, expectedFee, balance: expectedFee - totalVerified }));
            }
        }
        res.status(200).json({
            fullyPaid,
            awaitingVerification,
            partiallyPaid,
            notPaid,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Something went wrong while generating summary" });
    }
});
exports.getPaymentSummary = getPaymentSummary;
const getPaymentHistoryByParentId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { parentId } = req.params;
    try {
        // Find all students belonging to the parent
        const students = yield prisma.student.findMany({
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
        const studentIds = students.map((student) => student.id);
        // Fetch all payments for those students
        const payments = yield prisma.payment.findMany({
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
        const response = payments.map((payment) => ({
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
    }
    catch (error) {
        console.error("Error getting payment history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPaymentHistoryByParentId = getPaymentHistoryByParentId;
// Admin function to set section fees
const setSectionFee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sectionId, amount } = req.body;
    try {
        const sectionFee = yield prisma.sectionFee.upsert({
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
    }
    catch (error) {
        console.error("Error setting section fee:", error);
        res.status(500).json({ error: "Error setting section fee" });
    }
});
exports.setSectionFee = setSectionFee;
// Get all section fees
const getSectionFees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sectionFees = yield prisma.sectionFee.findMany({
            include: {
                section: true,
            },
        });
        res.status(200).json({ sectionFees });
    }
    catch (error) {
        console.error("Error getting section fees:", error);
        res.status(500).json({ error: "Error getting section fees" });
    }
});
exports.getSectionFees = getSectionFees;
// Get payments awaiting verification
const getPaymentsAwaitingVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payments = yield prisma.payment.findMany({
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
    }
    catch (error) {
        console.error("Error getting payments awaiting verification:", error);
        res
            .status(500)
            .json({ error: "Error getting payments awaiting verification" });
    }
});
exports.getPaymentsAwaitingVerification = getPaymentsAwaitingVerification;
