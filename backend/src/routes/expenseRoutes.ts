import { Router } from "express";
import {
  createExpense,
  dashboardSummary,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from "../controllers/expenseController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/dashboard/summary", asyncHandler(dashboardSummary));
router.get("/", asyncHandler(listExpenses));
router.get("/:id", asyncHandler(getExpense));
router.post("/", asyncHandler(createExpense));
router.put("/:id", asyncHandler(updateExpense));
router.delete("/:id", asyncHandler(deleteExpense));

export default router;
