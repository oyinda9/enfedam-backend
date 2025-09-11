// src/controllers/GalleryController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
const prisma = new PrismaClient();

// Cloudinary config
cloudinary.config({
  cloud_name: "dfnltp4z0",
  api_key: "986728377243281",
  api_secret: "F4mBQ7TuRD-FwT02Gf19bXJAYbU",
});

// Multer storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "gallery", 
      public_id: `${Date.now()}-${file.originalname}`,
      format: path.extname(file.originalname).replace(".", ""), 
    };
  },
});

export const upload = multer({ storage }).single("image");

// Upload image
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const fileUrl = req.file.path; // Cloudinary URL

    const image = await prisma.galleryImage.create({
      data: {
        url: fileUrl,
        filename: req.file.originalname,
      },
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      image,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

// Get all gallery images
export const getGallery = async (_req: Request, res: Response): Promise<void> => {
  try {
    const images = await prisma.galleryImage.findMany();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch gallery images" });
  }
};

// Delete an image
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const image = await prisma.galleryImage.findUnique({
      where: { id: Number(id) },
    });

    if (!image) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    await prisma.galleryImage.delete({ where: { id: Number(id) } });

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
