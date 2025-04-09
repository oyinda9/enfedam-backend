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
exports.updateEvent = exports.deleteEvent = exports.getAllEvents = exports.createEvent = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create an event
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, classId } = req.body;
        const event = yield prisma.event.create({
            data: { title, description },
        });
        res.status(201).json(event);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create event" });
    }
});
exports.createEvent = createEvent;
// Get all events
const getAllEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield prisma.event.findMany({
            select: { id: true, title: true, description: true, createdAt: true },
        });
        res.status(200).json(events);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch events" });
    }
});
exports.getAllEvents = getAllEvents;
// Delete an event
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.event.delete({ where: { id: Number(id) } });
        res.status(200).json({ message: "Event deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete event" });
    }
});
exports.deleteEvent = deleteEvent;
// Update an event
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, classId } = req.body;
        const updatedEvent = yield prisma.event.update({
            where: { id: Number(id) },
            data: { title, description },
        });
        res.status(200).json(updatedEvent);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update event" });
    }
});
exports.updateEvent = updateEvent;
