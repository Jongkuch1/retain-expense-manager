import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function platformInsights(_req: Request, res: Response) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalUsers,
    totalExpenses,
    expenseAggregate,
    expensesThisMonth,
    categories,
    recentExpenses,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.expense.count(),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.expense.count({ where: { date: { gte: startOfMonth, lte: endOfMonth } } }),
    prisma.category.findMany({
      include: { _count: { select: { expenses: true } } },
    }),
    prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const expensesByCategory = await prisma.expense.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
  });

  const spendingPerCategory = categories.map((c) => {
    const sum = expensesByCategory.find((e) => e.categoryId === c.id)?._sum.amount ?? 0;
    return { categoryId: c.id, name: c.name, totalSpent: sum, usageCount: c._count.expenses };
  });

  const sortedByUsage = [...spendingPerCategory].sort((a, b) => b.usageCount - a.usageCount);

  res.json({
    totalUsers,
    totalExpenses,
    totalExpenseValue: expenseAggregate._sum.amount ?? 0,
    expensesThisMonth,
    spendingPerCategory,
    topCategories: sortedByUsage.slice(0, 5),
    bottomCategories: sortedByUsage.slice(-5).reverse(),
    recentExpenses,
    recentUsers,
  });
}
