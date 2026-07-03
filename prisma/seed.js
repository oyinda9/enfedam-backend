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
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Only seed in development
            if (process.env.NODE_ENV === "production") {
                console.log("⚠️  Skipping seed in production environment");
                return;
            }
            // Check if admin already exists
            const existingAdmin = yield prisma.admin.findUnique({
                where: { username: "admin" },
            });
            if (existingAdmin) {
                console.log("✓ Demo superadmin account already exists");
                console.log("  Username: admin");
                console.log("  Password: admin123");
                return;
            }
            // Hash password
            const hashedPassword = yield bcryptjs_1.default.hash("admin123", 10);
            // Create demo superadmin
            const admin = yield prisma.admin.create({
                data: {
                    username: "admin",
                    password: hashedPassword,
                    role: "ADMIN",
                },
            });
            console.log("✓ Demo superadmin account created successfully!");
            console.log("  Username: admin");
            console.log("  Password: admin123");
            console.log("  Role: ADMIN");
            console.log("  ID:", admin.id);
        }
        catch (error) {
            console.error("Error seeding database:", error);
            throw error;
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
