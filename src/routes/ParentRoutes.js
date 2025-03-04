"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ParentController_1 = require("../controllers/ParentController");
const router = express_1.default.Router();
router.post("/", ParentController_1.createParent);
router.get("/", ParentController_1.getAllParents);
// router.get("/:id", getParentById);
router.put("/:id", ParentController_1.updateParent);
router.delete("/:id", ParentController_1.deleteParent);
exports.default = router;
