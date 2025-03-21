"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const StudentRoutes_1 = __importDefault(require("./routes/StudentRoutes"));
const ParentRoutes_1 = __importDefault(require("./routes/ParentRoutes"));
const AdminRoutes_1 = __importDefault(require("./routes/AdminRoutes"));
const TeacherRoutes_1 = __importDefault(require("./routes/TeacherRoutes"));
const LessonRoutes_1 = __importDefault(require("./routes/LessonRoutes"));
const ResultRoutes_1 = __importDefault(require("./routes/ResultRoutes"));
const ClassRoute_1 = __importDefault(require("./routes/ClassRoute"));
const EventRoutes_1 = __importDefault(require("./routes/EventRoutes"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = 5003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Use student routes
app.use("/students", StudentRoutes_1.default);
app.use("/parents", ParentRoutes_1.default);
app.use("/admin", AdminRoutes_1.default);
app.use("/teachers", TeacherRoutes_1.default);
app.use("/lesson", LessonRoutes_1.default);
app.use("/results", ResultRoutes_1.default);
app.use("/class", ClassRoute_1.default);
app.use("/events", EventRoutes_1.default);
app.use("/auth", AuthRoutes_1.default);
// Health check endpoint
app.get("/", (req, res) => {
    res.send("School Management System Backend is running!");
});
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
