import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import {
  submitForReview,
  publishResults,
  unpublishResults,
  listPublications,
  getStudentPublicationStatus,
} from "../controllers/ResultPublicationController";

const router = Router();
const staffOnly = requireRole(Role.ADMIN, Role.TEACHER);
const adminOnly = requireRole(Role.ADMIN);

router.post("/submit", authenticate, staffOnly, submitForReview);
router.post("/publish", authenticate, adminOnly, publishResults);
router.post("/unpublish", authenticate, adminOnly, unpublishResults);

// Ownership/role checks happen inside the controller since studentId is a
// query param here, not a route param - any authenticated role may call it.
router.get("/status", authenticate, getStudentPublicationStatus);

// classId given -> teacher (own class) or admin; omitted -> admin-only queue.
router.get("/", authenticate, staffOnly, listPublications);

export default router;
