import { api } from "./client";
import type {
  AdminInsights,
  Budget,
  Category,
  DashboardSummary,
  Expense,
  ExpenseInput,
  PaginatedExpenses,
  Role,
  User,
} from "../types";

export interface ExpenseQuery {
  search?: string;
  categoryId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const authApi = {
  async register(name: string, email: string, password: string) {
    const { data } = await api.post<{ token: string; user: User }>("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },
  async login(email: string, password: string) {
    const { data } = await api.post<{ token: string; user: User }>("/auth/login", {
      email,
      password,
    });
    return data;
  },
  async me() {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data.user;
  },
};

export const categoryApi = {
  async list() {
    const { data } = await api.get<{ categories: Category[] }>("/categories");
    return data.categories;
  },
  async create(name: string) {
    const { data } = await api.post<{ category: Category }>("/categories", { name });
    return data.category;
  },
  async update(id: string, name: string) {
    const { data } = await api.put<{ category: Category }>(`/categories/${id}`, { name });
    return data.category;
  },
  async remove(id: string) {
    await api.delete(`/categories/${id}`);
  },
};

export const expenseApi = {
  async list(query: ExpenseQuery) {
    const { data } = await api.get<PaginatedExpenses>("/expenses", { params: query });
    return data;
  },
  async get(id: string) {
    const { data } = await api.get<{ expense: Expense }>(`/expenses/${id}`);
    return data.expense;
  },
  async create(input: ExpenseInput) {
    const { data } = await api.post<{ expense: Expense }>("/expenses", input);
    return data.expense;
  },
  async update(id: string, input: Partial<ExpenseInput>) {
    const { data } = await api.put<{ expense: Expense }>(`/expenses/${id}`, input);
    return data.expense;
  },
  async remove(id: string) {
    await api.delete(`/expenses/${id}`);
  },
  async dashboard(month: number, year: number) {
    const { data } = await api.get<DashboardSummary>("/expenses/dashboard/summary", {
      params: { month, year },
    });
    return data;
  },
};

export const budgetApi = {
  async get(month: number, year: number) {
    const { data } = await api.get<{ budget: Budget | null }>("/budgets", {
      params: { month, year },
    });
    return data.budget;
  },
  async upsert(month: number, year: number, amount: number) {
    const { data } = await api.put<{ budget: Budget }>("/budgets", { month, year, amount });
    return data.budget;
  },
};

export const adminApi = {
  async insights() {
    const { data } = await api.get<AdminInsights>("/admin/insights");
    return data;
  },
};

export type { Role };
