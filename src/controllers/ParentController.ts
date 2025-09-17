import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const createParent = async (req: Request, res: Response) => {
  const { username, name, surname, email, phone, address } = req.body;

  try {
    const parent = await prisma.parent.create({
      data: {
        id: crypto.randomUUID(), // Ensure `id` is generated or remove if Prisma auto-generates it
        username,
        name,
        surname,
        email,
        phone,
        address,
      },
    });

    res.status(201).json(parent);
  } catch (error: any) {
    console.error(error);
    res
      .status(400)
      .json({ error: "Failed to create parent", details: error.message });
  }
};

export const getAllParents = async (req: Request, res: Response) => {
  try {
    const parents = await prisma.parent.findMany({
      include: { students: true }, // Include children details
    });

    res.status(200).json(parents);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch parents", details: error.message });
  }
};

export const getParentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: { students: true },
    });

    if (!parent) res.status(404).json({ error: "Parent not found" });

    res.status(200).json(parent);
    return;
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch parent", details: error.message });
  }
};

export const updateParent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, name, surname, email, phone, address } = req.body;

  try {
    const parent = await prisma.parent.update({
      where: { id },
      data: { username, name, surname, email, phone, address },
    });

    res.status(200).json(parent);
  } catch (error: any) {
    res
      .status(400)
      .json({ error: "Failed to update parent", details: error.message });
  }
};

export const deleteParent = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.parent.delete({ where: { id } });
    res.status(200).json({ message: "Parent and students deleted successfully" });
    return;
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ error: "Parent not found" });
      return;
    }
    res
      .status(400)
      .json({ error: "Failed to delete parent", details: error.message });
  }
};

                     

