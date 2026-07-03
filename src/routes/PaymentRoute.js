"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/paymentRoutes.ts
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const PaymentController_1 = require("../controllers/PaymentController");
const router = express_1.default.Router();
// Ensure uploads/receipts directory exists
const uploadDir = path_1.default.join(__dirname, "../uploads/receipts");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error("Invalid file type. Only JPEG, PNG, JPG and PDF files are allowed."));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
// Parent routes
router.post("/upload", upload.single("receipt"), PaymentController_1.uploadReceipt);
router.get("/history/:parentId", PaymentController_1.getPaymentHistoryByParentId);
router.get("/status/:studentId", PaymentController_1.checkPaymentStatus);
// Admin routes
router.patch("/verify/:paymentId", PaymentController_1.verifyPayment);
router.patch("/reject/:paymentId", PaymentController_1.rejectPayment);
router.get("/summary", PaymentController_1.getPaymentSummary);
router.post("/fees", PaymentController_1.setSectionFee);
router.get("/fees", PaymentController_1.getSectionFees);
router.get("/awaiting-verification", PaymentController_1.getPaymentsAwaitingVerification);
exports.default = router;
