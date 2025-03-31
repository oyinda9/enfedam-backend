import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create an event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, classId } = req.body;
    const event = await prisma.event.create({
      data: { title, description },
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  }
};

// Get all events
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      select: { id: true, title: true, description: true, createdAt: true },
    });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Delete an event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" });
  }
};

// Update an event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, classId } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { id: Number(id) },
      data: { title, description},
    });

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: "Failed to update event" });
  }
};
