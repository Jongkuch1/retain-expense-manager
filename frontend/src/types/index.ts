export type Role = "USER" | "ADMIN";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "MOBILE_MONEY" | "OTHER";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "MOBILE_MONEY",
  "OTHER",
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  categoryId: string;
}

export interface PaginatedExpenses {
  items: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Budget {
  id: string;
  month: number;
  year: number;
  amount: number;
}

export type BudgetStatus = "no-budget" | "within" | "approaching" | "over";

export interface DashboardSummary {
  month: number;
  year: number;
  totalSpent: number;
  budget: number | null;
  remaining: number | null;
  status: BudgetStatus;
  highestExpense: Expense | null;
  spendingByCategory: { categoryId: string; name: string; total: number }[];
  recentExpenses: Expense[];
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  spendingPerCategory: { categoryId: string; name: string; totalSpent: number; usageCount: number }[];
  topCategories: { categoryId: string; name: string; totalSpent: number; usageCount: number }[];
  bottomCategories: { categoryId: string; name: string; totalSpent: number; usageCount: number }[];
  recentExpenses: Expense[];
  recentUsers: { id: string; name: string; email: string; role: Role; createdAt: string }[];
}
