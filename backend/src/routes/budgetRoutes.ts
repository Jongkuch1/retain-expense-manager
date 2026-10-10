import { Router } from "express";
import { getBudget, upsertBudget } from "../controllers/budgetController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(getBudget));
router.put("/", asyncHandler(upsertBudget));

export default router;
