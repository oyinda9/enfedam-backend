"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizesStudentCreation = exports.authorizeTeacherCreation = exports.authorizeParentCreation = exports.authorizeAdmin = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client"); // Import the Role enum from Prisma
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is not set");
}
// Middleware to verify the JWT and extract user information
const authenticateAdmin = (req, res, next) => {
    var _a;
    try {
        // Extract the token from the Authorization header
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ error: "Access denied. No token provided." });
            return;
        }
        // Verify the token and decode the user info
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        // Ensure the token contains valid user info
        if (!decoded.id || !decoded.role) {
            res.status(400).json({ error: "Invalid token payload" });
            return;
        }
        // Cast the role to Role enum explicitly
        req.user = {
            id: decoded.id,
            role: decoded.role, // Explicitly cast the role to Role enum
        };
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        console.error("Token Verification Error:", error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: "Token expired" });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        res.status(500).json({ error: "Authentication failed" });
        return;
    }
};
exports.authenticateAdmin = authenticateAdmin;
// Middleware to check if the user is an admin and allow access accordingly
const authorizeAdmin = (req, res, next) => {
    var _a;
    // Check if the logged-in user's role is 'ADMIN'
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_1.Role.ADMIN) {
        res.status(403).json({ error: "Forbidden. You do not have permission to perform this action." });
        return;
    }
    // If authorized (user is admin), proceed to the next middleware or route handler
    next();
};
exports.authorizeAdmin = authorizeAdmin;
// Middleware to prevent a parent (USER role) from creating another parent
const authorizeParentCreation = (req, res, next) => {
    var _a;
    // Check if the logged-in user is a parent (USER role)
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === client_1.Role.USER) {
        res.status(403).json({ error: "Unauthorized: You are not allowed to create a parent." });
        return;
    }
    // If not a parent (they may be an admin or other authorized role), proceed
    next();
};
exports.authorizeParentCreation = authorizeParentCreation;
const authorizeTeacherCreation = (req, res, next) => {
    var _a;
    // Check if the logged-in user is a parent (USER role)
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === client_1.Role.TEACHER) {
        res.status(403).json({ error: "Unauthorized: You are not allowed to create a TEACHER." });
        return;
    }
    // If not a parent (they may be an admin or other authorized role), proceed
    next();
};
exports.authorizeTeacherCreation = authorizeTeacherCreation;
const authorizesStudentCreation = (req, res, next) => {
    var _a;
    // Check if the logged-in user is a parent (USER role)
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === client_1.Role.STUDENT) {
        res.status(403).json({ error: "Unauthorized: You are not allowed to create a student." });
        return;
    }
    // If not a parent (they may be an admin or other authorized role), proceed
    next();
};
exports.authorizesStudentCreation = authorizesStudentCreation;
