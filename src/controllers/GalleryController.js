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
exports.deleteImage = exports.getGallery = exports.uploadImage = exports.upload = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
// Cloudinary config
cloudinary_1.v2.config({
    cloud_name: "dfnltp4z0",
    api_key: "986728377243281",
    api_secret: "F4mBQ7TuRD-FwT02Gf19bXJAYbU",
});
// Multer storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: (req, file) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            folder: "gallery",
            public_id: `${Date.now()}-${file.originalname}`,
            format: path_1.default.extname(file.originalname).replace(".", ""),
        };
    }),
});
exports.upload = (0, multer_1.default)({ storage }).single("image");
// Upload image
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }
        const fileUrl = req.file.path; // Cloudinary URL
        const image = yield prisma.galleryImage.create({
            data: {
                url: fileUrl,
                filename: req.file.originalname,
            },
        });
        res.status(201).json({
            message: "Image uploaded successfully",
            image,
        });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Failed to upload image" });
    }
});
exports.uploadImage = uploadImage;
// Get all gallery images
const getGallery = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield prisma.galleryImage.findMany();
        res.json(images);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch gallery images" });
    }
});
exports.getGallery = getGallery;
// Delete an image
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const image = yield prisma.galleryImage.findUnique({
            where: { id: Number(id) },
        });
        if (!image) {
            res.status(404).json({ error: "Image not found" });
            return;
        }
        yield prisma.galleryImage.delete({ where: { id: Number(id) } });
        res.json({ message: "Image deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete image" });
    }
});
exports.deleteImage = deleteImage;
