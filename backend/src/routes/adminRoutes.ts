import { Router } from "express";
import { platformInsights } from "../controllers/adminController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/insights", asyncHandler(platformInsights));

export default router;
