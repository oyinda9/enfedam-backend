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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.registerExecutive = exports.registerAdmin = void 0;
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
// export const registerExecutive = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       res.status(400).json({ error: "Username and password required" });
//       return; // Ensure the function exits after sending the response
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const executive = await prisma.executive.create({
//       data: {
//         username,
//         password: hashedPassword,
//         role: Role.EXECUTIVE,
//       },
//     });
//     res.status(201).json({ message: "Executive registered", executive });
//   } catch (error) {
//     console.error("Registration Error:", error);
//     res.status(500).json({ error: "Failed to register executive" });
//   }
// };
const registerExecutive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ error: "Username and password required" });
            return;
        }
        // Check if username already exists in Executive table
        const existingExecutive = yield prisma.executive.findUnique({
            where: { username }
        });
        if (existingExecutive) {
            res.status(400).json({ error: "Executive username already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const executive = yield prisma.executive.create({
            data: {
                username,
                password: hashedPassword,
                role: client_1.Role.EXECUTIVE,
            },
        });
        // Don't return password in response
        const { password: _ } = executive, executiveData = __rest(executive, ["password"]);
        res.status(201).json({
            message: "Executive registered",
            executive: executiveData
        });
    }
    catch (error) {
        console.error("Executive Registration Error:", error);
        res.status(500).json({ error: "Failed to register executive" });
    }
});
exports.registerExecutive = registerExecutive;
// export const login = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { identifier, password, surname } = req.body;
//     // Ensure that identifier (either username or email) is provided
//     if (!identifier) {
//       res.status(400).json({ error: "Username or email is required" });
//       return;
//     }
//     let user: any;
//     let role: Role | undefined;
//     // For Admins, we check the username only
//     if (!identifier.includes("@")) {
//       // Login using username for Admins only
//       user = await prisma.admin.findUnique({ where: { username: identifier } });
//       if (user) {
//         role = Role.ADMIN; // Assign role for admin
//       }
//     } else {
//       // Login using email and surname (for non-admins)
//       if (!surname) {
//         res
//           .status(400)
//           .json({ error: "Surname is required for non-admin login" });
//         return;
//       }
//       // Check for Teacher with matching email and surname
//       user = await prisma.teacher.findFirst({
//         where: {
//           email: identifier,
//           surname: surname,
//         },
//       });
//       if (user) {
//         role = Role.TEACHER;
//       }
//       // Check for Student with matching email and surname
//       if (!user) {
//         user = await prisma.student.findFirst({
//           where: {
//             email: identifier,
//             surname: surname,
//           },
//         });
//         if (user) {
//           role = Role.STUDENT;
//         }
//       }
//       // Check for User with matching email and surname (Parent in this case)
//       if (!user) {
//         user = await prisma.parent.findFirst({
//           where: {
//             email: identifier,
//             surname: surname,
//           },
//         });
//         if (user) {
//           role = Role.USER; // Non-admin role for parent
//         }
//       }
//     }
//     // If user is not found
//     if (!user || !role) {
//       res.status(404).json({ error: "User not found" });
//       return;
//     }
//     // Admins require password validation
//     if (role === Role.ADMIN) {
//       if (!password) {
//         res.status(400).json({ error: "Password is required for admin login" });
//         return;
//       }
//       const isValid = await bcrypt.compare(password, user.password);
//       if (!isValid) {
//         res.status(401).json({ error: "Invalid credentials" });
//         return;
//       }
//     }
//     // Executives require password validation
//     // Note: In this case, we assume that executives are also stored in the admin table
//     if (role === Role.EXECUTIVE) {
//       if (!password) {
//         res
//           .status(400)
//           .json({ error: "Password is required for executive login" });
//         return;
//       }
//       const isValid = await bcrypt.compare(password, user.password);
//       if (!isValid) {
//         res.status(401).json({ error: "Invalid credentials" });
//         return;
//       }
//     }
//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user.id, role },
//       process.env.JWT_SECRET || "secret",
//       {
//         expiresIn: "1d",
//       }
//     );
//     // Pass the token in the Authorization header
//     res.setHeader("Authorization", `Bearer ${token}`);
//     res.status(200).json({
//       message: "Login successful",
//       token,
//       role,
//       user: {
//         id: user.id,
//         username: user.username || null,
//         name: user.name || null,
//         surname: user.surname || null,
//         email: user.email || null,
//         phone: user.phone || null,
//         address: user.address || null,
//       },
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ error: "Login failed" });
//   }
// };
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { identifier, password, surname } = req.body;
        if (!identifier) {
            res.status(400).json({ error: "Username or email is required" });
            return;
        }
        let user;
        let role;
        // Admin or Executive login via username
        if (!identifier.includes("@")) {
            // Try Admin
            user = yield prisma.admin.findUnique({ where: { username: identifier } });
            if (user) {
                role = client_1.Role.ADMIN;
            }
            // If not Admin, try Executive
            if (!user) {
                user = yield prisma.executive.findUnique({ where: { username: identifier } });
                if (user) {
                    role = client_1.Role.EXECUTIVE;
                }
            }
            if (!password) {
                res.status(400).json({ error: "Password is required" });
                return;
            }
            if (user) {
                const isValid = yield bcryptjs_1.default.compare(password, user.password);
                if (!isValid) {
                    res.status(401).json({ error: "Invalid credentials" });
                    return;
                }
            }
        }
        else {
            // Email login for Teacher, Student, Parent
            if (!surname) {
                res.status(400).json({ error: "Surname is required for non-admin login" });
                return;
            }
            // Try Teacher
            user = yield prisma.teacher.findFirst({
                where: {
                    email: identifier,
                    surname: surname,
                },
            });
            if (user) {
                role = client_1.Role.TEACHER;
            }
            // Try Student
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
            // Try Parent
            if (!user) {
                user = yield prisma.parent.findFirst({
                    where: {
                        email: identifier,
                        surname: surname,
                    },
                });
                if (user) {
                    role = client_1.Role.USER;
                }
            }
        }
        // Not found
        if (!user || !role) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // JWT Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
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
