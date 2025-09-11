import express from "express";
import { upload, uploadImage, getGallery, deleteImage } from "../controllers/GalleryController";

const router = express.Router();

router.post("/upload", upload, uploadImage);
router.get("/gallery", getGallery);
router.delete("/gallery/:id", deleteImage);

export default router;
