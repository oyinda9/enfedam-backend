import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";

const prisma = new PrismaClient();

// Configure multer storage
const storage = multer.diskStorage({
  destination: "system_images/", // new folder for images
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage }).single("image");

// ================== GALLERY CONTROLLERS ==================

// Upload a new image
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // const fileUrl = `${req.protocol}://${req.get("host")}/system_images/${req.file.filename}`;
    const fileUrl = `https://enfedam-backend.onrender.com/system_images/${req.file.filename}`;


    const image = await prisma.galleryImage.create({
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });

    res.status(201).json(image);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

// Fetch all images
export const getGallery = async (req: Request, res: Response) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { uploadedAt: "desc" },
    });
    res.json(images);
  } catch (error) {
    console.error("Fetch gallery error:", error);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
};

// Delete an image
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const image = await prisma.galleryImage.findUnique({ where: { id: Number(id) } });
    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    const fs = await import("fs");
    const filePath = path.join(__dirname, "../system_images", image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.galleryImage.delete({ where: { id: Number(id) } });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
