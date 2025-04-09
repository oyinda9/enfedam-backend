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
exports.login = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
// Register Admin
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Username and password required" });
            return; // Ensure the function exits after sending the response
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const admin = yield prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: "Admin registered", admin });
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: "Failed to register admin" });
    }
});
exports.registerAdmin = registerAdmin;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password, surname } = req.body;
        // Ensure that identifier (either username or email) is provided
        if (!identifier) {
            res.status(400).json({ error: "Username or email is required" });
            return;
        }
        let user;
        let role;
        // For Admins, we check the username only
        if (!identifier.includes("@")) {
            // Login using username for Admins only
            user = yield prisma.admin.findUnique({ where: { username: identifier } });
            if (user) {
                role = client_1.Role.ADMIN; // Assign role for admin
            }
        }
        else {
            // Login using email and surname (for non-admins)
            if (!surname) {
                res
                    .status(400)
                    .json({ error: "Surname is required for non-admin login" });
                return;
            }
            // Check for Teacher with matching email and surname
            user = yield prisma.teacher.findFirst({
                where: {
                    email: identifier,
                    surname: surname,
                },
            });
            if (user) {
                role = client_1.Role.TEACHER;
            }
            // Check for Student with matching email and surname
            if (!user) {
                user = yield prisma.student.findFirst({
                    where: {
                        email: identifier,
                        surname: surname,
                    },
                });
                if (user) {
                    role = client_1.Role.STUDENT;
                }
            }
            // Check for User with matching email and surname (Parent in this case)
            if (!user) {
                user = yield prisma.parent.findFirst({
                    where: {
                        email: identifier,
                        surname: surname,
                    },
                });
                if (user) {
                    role = client_1.Role.USER; // Non-admin role for parent
                }
            }
        }
        // If user is not found
        if (!user || !role) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Admins require password validation
        if (role === client_1.Role.ADMIN) {
            if (!password) {
                res.status(400).json({ error: "Password is required for admin login" });
                return;
            }
            const isValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isValid) {
                res.status(401).json({ error: "Invalid credentials" });
                return;
            }
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role }, process.env.JWT_SECRET || "secret", {
            expiresIn: "1d",
        });
        // Pass the token in the Authorization header
        res.setHeader("Authorization", `Bearer ${token}`);
        res.status(200).json({
            message: "Login successful",
            token,
            role,
            user: {
                id: user.id,
                username: user.username || null,
                name: user.name || null,
                surname: user.surname || null,
                email: user.email || null,
                phone: user.phone || null,
                address: user.address || null,
            },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});
exports.login = login;
