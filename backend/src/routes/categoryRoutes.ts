import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/categoryController";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listCategories));
router.post("/", requireAdmin, asyncHandler(createCategory));
router.put("/:id", requireAdmin, asyncHandler(updateCategory));
router.delete("/:id", requireAdmin, asyncHandler(deleteCategory));

export default router;
