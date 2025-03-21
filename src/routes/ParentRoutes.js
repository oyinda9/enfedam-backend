"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ParentController_1 = require("../controllers/ParentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Apply middleware to routes
router.post("/", authMiddleware_1.authenticateAdmin, authMiddleware_1.authorizeAdmin, authMiddleware_1.authorizeParentCreation, ParentController_1.createParent); // Only admins can create parents
router.get("/", ParentController_1.getAllParents); // Public route (no authentication required)
router.get("/:id", ParentController_1.getParentById); // Public route (no authentication required)
router.put("/:id", authMiddleware_1.authenticateAdmin, authMiddleware_1.authorizeAdmin, ParentController_1.updateParent); // Only admins can update parents
router.delete("/:id", authMiddleware_1.authenticateAdmin, authMiddleware_1.authorizeAdmin, ParentController_1.deleteParent); // Only admins can delete parents
exports.default = router;
