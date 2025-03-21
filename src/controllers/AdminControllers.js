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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdmin = exports.updateAdmin = exports.getAdminById = exports.getAllAdmins = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// export const createAdmin = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { username } = req.body;
//     // Count the existing admins to generate unique admin IDs
//     const count = await prisma.admin.count();
//     const newAdminId = `admin${count + 1}`;
//     const admin = await prisma.admin.create({
//       data: {
//         id: newAdminId,
//         username,
//       },
//     });
//     res.status(201).json(admin);
//   } catch (error) {
//     console.error("Error creating admin:", error);
//     res.status(500).json({ error: "Failed to create admin" });
//   }
// };
// ✅ Get all Admins
const getAllAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma.admin.findMany();
        res.status(200).json(admins);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch admins" });
    }
});
exports.getAllAdmins = getAllAdmins;
// ✅ Get a single Admin by ID
const getAdminById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const admin = yield prisma.admin.findUnique({
            where: { id },
        });
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }
        res.status(200).json(admin);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch admin" });
    }
});
exports.getAdminById = getAdminById;
// ✅ Update an Admin
const updateAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username } = req.body;
        const admin = yield prisma.admin.update({
            where: { id },
            data: { username },
        });
        res.status(200).json(admin);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update admin" });
    }
});
exports.updateAdmin = updateAdmin;
// ✅ Delete an Admin
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.admin.delete({
            where: { id },
        });
        res.status(200).json({ message: "Admin deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete admin" });
    }
});
exports.deleteAdmin = deleteAdmin;
