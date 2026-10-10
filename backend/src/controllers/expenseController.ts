import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

const paymentMethods = ["CASH", "CARD", "BANK_TRANSFER", "MOBILE_MONEY", "OTHER"] as const;

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.coerce.date(),
  paymentMethod: z.enum(paymentMethods).default("CASH"),
  notes: z.string().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
});

const querySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethod: z.enum(paymentMethods).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(["date", "amount"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export async function listExpenses(req: Request, res: Response) {
  const q = querySchema.parse(req.query);
  const userId = req.user!.userId;

  const where: Prisma.ExpenseWhereInput = {
    userId,
    ...(q.search ? { title: { contains: q.search, mode: "insensitive" } } : {}),
    ...(q.categoryId ? { categoryId: q.categoryId } : {}),
    ...(q.paymentMethod ? { paymentMethod: q.paymentMethod } : {}),
    ...(q.startDate || q.endDate
      ? {
          date: {
            ...(q.startDate ? { gte: q.startDate } : {}),
            ...(q.endDate ? { lte: q.endDate } : {}),
          },
        }
      : {}),
    ...(q.minAmount !== undefined || q.maxAmount !== undefined
      ? {
          amount: {
            ...(q.minAmount !== undefined ? { gte: q.minAmount } : {}),
            ...(q.maxAmount !== undefined ? { lte: q.maxAmount } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { [q.sortBy]: q.sortOrder },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  res.json({
    items,
    total,
    page: q.page,
    pageSize: q.pageSize,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  });
}

export async function getExpense(req: Request, res: Response) {
  const expense = await prisma.expense.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
    include: { category: true },
  });
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }
  res.json({ expense });
}

export async function createExpense(req: Request, res: Response) {
  const data = expenseSchema.parse(req.body);
  const userId = req.user!.userId;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new ApiError(400, "Selected category does not exist");
  }

  const expense = await prisma.expense.create({
    data: { ...data, userId },
    include: { category: true },
  });
  res.status(201).json({ expense });
}

export async function updateExpense(req: Request, res: Response) {
  const data = expenseSchema.partial().parse(req.body);
  const userId = req.user!.userId;

  const existing = await prisma.expense.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    throw new ApiError(404, "Expense not found");
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new ApiError(400, "Selected category does not exist");
    }
  }

  const expense = await prisma.expense.update({
    where: { id: req.params.id },
    data,
    include: { category: true },
  });
  res.json({ expense });
}

export async function deleteExpense(req: Request, res: Response) {
  const userId = req.user!.userId;
  const existing = await prisma.expense.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) {
    throw new ApiError(404, "Expense not found");
  }

  await prisma.expense.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function dashboardSummary(req: Request, res: Response) {
  const userId = req.user!.userId;
  const now = new Date();
  const month = Number(req.query.month) || now.getMonth() + 1;
  const year = Number(req.query.year) || now.getFullYear();

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const monthExpenses = await prisma.expense.findMany({
    where: { userId, date: { gte: startOfMonth, lte: endOfMonth } },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const budget = await prisma.budget.findUnique({
    where: { userId_month_year: { userId, month, year } },
  });

  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const highestExpense = monthExpenses.reduce(
    (max, e) => (e.amount > (max?.amount ?? -Infinity) ? e : max),
    null as (typeof monthExpenses)[number] | null,
  );

  const byCategory = new Map<string, { categoryId: string; name: string; total: number }>();
  for (const e of monthExpenses) {
    const key = e.categoryId;
    const entry = byCategory.get(key) ?? { categoryId: key, name: e.category.name, total: 0 };
    entry.total += e.amount;
    byCategory.set(key, entry);
  }

  const budgetAmount = budget?.amount ?? null;
  const remaining = budgetAmount !== null ? budgetAmount - totalSpent : null;
  let status: "no-budget" | "within" | "approaching" | "over" = "no-budget";
  if (budgetAmount !== null) {
    const ratio = budgetAmount > 0 ? totalSpent / budgetAmount : totalSpent > 0 ? Infinity : 0;
    if (ratio > 1) status = "over";
    else if (ratio >= 0.8) status = "approaching";
    else status = "within";
  }

  res.json({
    month,
    year,
    totalSpent,
    budget: budgetAmount,
    remaining,
    status,
    highestExpense,
    spendingByCategory: Array.from(byCategory.values()).sort((a, b) => b.total - a.total),
    recentExpenses: monthExpenses.slice(0, 5),
  });
}
