"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
require("dotenv").config();
const StudentRoutes_1 = __importDefault(require("./routes/StudentRoutes"));
const ParentRoutes_1 = __importDefault(require("./routes/ParentRoutes"));
const AdminRoutes_1 = __importDefault(require("./routes/AdminRoutes"));
const TeacherRoutes_1 = __importDefault(require("./routes/TeacherRoutes"));
const LessonRoutes_1 = __importDefault(require("./routes/LessonRoutes"));
const ResultRoutes_1 = __importDefault(require("./routes/ResultRoutes"));
const ClassRoute_1 = __importDefault(require("./routes/ClassRoute"));
const EventRoutes_1 = __importDefault(require("./routes/EventRoutes"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const subjectRoute_1 = __importDefault(require("./routes/subjectRoute"));
const attendRoute_1 = __importDefault(require("./routes/attendRoute"));
const ExamRoutes_1 = __importDefault(require("./routes/ExamRoutes"));
const PaymentRoute_1 = __importDefault(require("./routes/PaymentRoute"));
const reportRoute_1 = __importDefault(require("./routes/reportRoute"));
const SectionRoute_1 = __importDefault(require("./routes/SectionRoute"));
const GalleryRoute_1 = __importDefault(require("./routes/GalleryRoute"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// CORS Configuration - Enhanced for security
const corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
// Body Parser Middleware with size limits
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// Security Headers (manual implementation without helmet for now)
app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Content-Security-Policy", "default-src 'self'");
    next();
});
// Simple Rate Limiting (without express-rate-limit for now)
const requestCounts = new Map();
app.use((req, res, next) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }
    const requests = requestCounts.get(ip);
    const recentRequests = requests.filter((time) => time > now - windowMs);
    if (recentRequests.length >= maxRequests) {
        res.status(429).json({
            error: "Too many requests from this IP, please try again later.",
        });
        return;
    }
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    next();
});
// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Static Files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use("/system_images", express_1.default.static(path_1.default.join(__dirname, "../system_images")));
// API Routes with v1 prefix
const apiPrefix = "/api/v1";
app.use(`${apiPrefix}/auth`, AuthRoutes_1.default);
app.use(`${apiPrefix}/students`, StudentRoutes_1.default);
app.use(`${apiPrefix}/parents`, ParentRoutes_1.default);
app.use(`${apiPrefix}/admin`, AdminRoutes_1.default);
app.use(`${apiPrefix}/teachers`, TeacherRoutes_1.default);
app.use(`${apiPrefix}/lesson`, LessonRoutes_1.default);
app.use(`${apiPrefix}/results`, ResultRoutes_1.default);
app.use(`${apiPrefix}/class`, ClassRoute_1.default);
app.use(`${apiPrefix}/events`, EventRoutes_1.default);
app.use(`${apiPrefix}/subject`, subjectRoute_1.default);
app.use(`${apiPrefix}/attendance`, attendRoute_1.default);
app.use(`${apiPrefix}/exam`, ExamRoutes_1.default);
app.use(`${apiPrefix}/payment`, PaymentRoute_1.default);
app.use(`${apiPrefix}/report`, reportRoute_1.default);
app.use(`${apiPrefix}/sections`, SectionRoute_1.default);
app.use(`${apiPrefix}/gallery`, GalleryRoute_1.default);
// Health check endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "School Management System Backend is running!",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});
// Health check for monitoring
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Route not found",
        path: req.path,
        timestamp: new Date().toISOString(),
    });
});
// Global Error Handler
const errorHandler = (err, req, res, _next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
    // Prisma errors
    if (err.code && err.code.startsWith("P")) {
        if (err.code === "P2002") {
            res.status(409).json({
                success: false,
                statusCode: 409,
                message: `Unique constraint violation`,
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (err.code === "P2025") {
            res.status(404).json({
                success: false,
                statusCode: 404,
                message: "Record not found",
                timestamp: new Date().toISOString(),
            });
            return;
        }
    }
    // Default error
    res.status(500).json({
        success: false,
        statusCode: 500,
        message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
        timestamp: new Date().toISOString(),
    });
};
app.use(errorHandler);
// Start the server
app.listen(port, () => {
    console.log(`\n🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API available at http://localhost:${port}/api/v1`);
    console.log(`🏥 Health check at http://localhost:${port}/health\n`);
});
