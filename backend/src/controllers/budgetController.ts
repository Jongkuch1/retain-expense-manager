import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";

const budgetSchema = z
  .object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000).max(2100),
    amount: z.number().nonnegative("Budget amount cannot be negative").max(1_000_000_000),
  })
  .strict();

export async function getBudget(req: Request, res: Response) {
  const userId = req.user!.userId;
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const budget = await prisma.budget.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  res.json({ budget });
}

export async function upsertBudget(req: Request, res: Response) {
  const data = budgetSchema.parse(req.body);
  const userId = req.user!.userId;

  const budget = await prisma.budget.upsert({
    where: { userId_month_year: { userId, month: data.month, year: data.year } },
    update: { amount: data.amount },
    create: { ...data, userId },
  });

  res.json({ budget });
}
