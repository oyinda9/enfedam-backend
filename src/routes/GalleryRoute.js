"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const GalleryController_1 = require("../controllers/GalleryController");
const router = express_1.default.Router();
router.post("/upload", GalleryController_1.upload, GalleryController_1.uploadImage);
router.get("/gallery", GalleryController_1.getGallery);
router.delete("/gallery/:id", GalleryController_1.deleteImage);
exports.default = router;
