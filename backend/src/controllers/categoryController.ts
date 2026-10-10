import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

const categorySchema = z
  .object({
    name: z.string().trim().min(1, "Category name is required").max(60),
  })
  .strict();

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ categories });
}

export async function createCategory(req: Request, res: Response) {
  const data = categorySchema.parse(req.body);

  const existing = await prisma.category.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new ApiError(409, "A category with this name already exists");
  }

  const category = await prisma.category.create({ data });
  res.status(201).json({ category });
}

export async function updateCategory(req: Request, res: Response) {
  const data = categorySchema.parse(req.body);
  const { id } = req.params;

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (category.isDefault) {
    throw new ApiError(400, "The default Uncategorized category cannot be renamed");
  }

  const updated = await prisma.category.update({ where: { id }, data });
  res.json({ category: updated });
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { expenses: true } } },
  });
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (category.isDefault) {
    throw new ApiError(400, "The default Uncategorized category cannot be deleted");
  }

  if (category._count.expenses > 0) {
    const fallback = await prisma.category.findFirst({ where: { isDefault: true } });
    if (!fallback) {
      throw new ApiError(500, "No default category available to reassign expenses to");
    }

    await prisma.$transaction([
      prisma.expense.updateMany({ where: { categoryId: id }, data: { categoryId: fallback.id } }),
      prisma.category.delete({ where: { id } }),
    ]);
    return res.status(200).json({
      message: `Deleted "${category.name}" and moved ${category._count.expenses} expense(s) to "${fallback.name}"`,
    });
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
}
