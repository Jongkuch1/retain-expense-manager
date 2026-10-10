import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { categoryApi, expenseApi } from "../api/endpoints";
import type { Category, Expense, ExpenseInput, PaginatedExpenses } from "../types";
import { ExpenseFiltersBar } from "../components/ExpenseFiltersBar";
import { ExpenseTable } from "../components/ExpenseTable";
import { ExpenseFormDialog } from "../components/ExpenseFormDialog";
import { setPage } from "../features/filters/filtersSlice";

export function ExpensesPage() {
  const filters = useAppSelector((state) => state.filters);
  const dispatch = useAppDispatch();

  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<PaginatedExpenses | null>(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  useEffect(() => {
    categoryApi.list().then(setCategories);
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const result = await expenseApi.list({
        search: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        paymentMethod: filters.paymentMethod || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        pageSize: filters.pageSize,
      });
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreate = () => {
    setEditingExpense(null);
    setFormOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleSubmit = async (input: ExpenseInput) => {
    if (editingExpense) {
      await expenseApi.update(editingExpense.id, input);
    } else {
      await expenseApi.create(input);
    }
    await loadExpenses();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await expenseApi.remove(deleteTarget.id);
    setDeleteTarget(null);
    await loadExpenses();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Expenses
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Add expense
        </Button>
      </Stack>

      <ExpenseFiltersBar categories={categories} />

      <ExpenseTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onPageChange={(page) => dispatch(setPage(page))}
      />

      <ExpenseFormDialog
        open={formOpen}
        categories={categories}
        initialExpense={editingExpense}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete expense?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This cannot be undone.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
