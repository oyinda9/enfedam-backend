import { Router, Request, Response } from "express";

const router = Router();

const TERMS = [
  { value: "FIRST", label: "First Term" },
  { value: "SECOND", label: "Second Term" },
  { value: "THIRD", label: "Third Term" },
];

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: TERMS });
});

export default router;
