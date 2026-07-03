"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, _next) => {
    var _a;
    const timestamp = new Date().toISOString();
    const path = req.path;
    const method = req.method;
    // Log the error
    console.error(`[ERROR] ${method} ${path} - ${err.message}`, err);
    // Check for Prisma errors (P2002 = unique constraint, P2025 = not found, etc)
    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                success: false,
                statusCode: 409,
                message: `Unique constraint violation: ${(_a = err.meta) === null || _a === void 0 ? void 0 : _a.target}`,
                timestamp,
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'Record not found',
                timestamp,
            });
        }
        if (err.code === 'P2003') {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'Foreign key constraint failed',
                timestamp,
            });
        }
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Database error',
            timestamp,
        });
    }
    // Custom API errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            timestamp,
        });
    }
    // Default error response
    res.status(500).json({
        success: false,
        statusCode: 500,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        timestamp,
    });
};
exports.errorHandler = errorHandler;
// Async wrapper to catch promise rejections
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
